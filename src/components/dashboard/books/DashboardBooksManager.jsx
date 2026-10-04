"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Filter,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
  Eye,
  BookOpen,
  Archive,
  RotateCcw,
  Edit3,
  Building2,
  MapPin,
  Bookmark,
  Hash,
  Layers,
  Calendar,
  AlertTriangle,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  RotateCcw as ResetIcon,
  Feather,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardBooksService } from "@/services/dashboardBooksService";
import { librariesService } from "@/services/librariesService";
import { authService } from "@/services/authService";
import { authorsService } from "@/services/authorsService";
import { categoriesService } from "@/services/categoriesService";
import { formatArabicNumber, cn } from "@/lib/utils";

export function DashboardBooksManager() {
  const { user } = useAuth();

  // Role resolution
  const roleCode = user?.role?.code || (typeof user?.role === "string" ? user.role : "") || "";
  const isReader = roleCode === "READER";
  const isLibrarian = roleCode === "LIBRARIAN";
  const isGovAdmin = roleCode === "GOVERNORATE_ADMIN";
  const isMinistryOrSuper = roleCode === "MINISTRY_ADMIN" || roleCode === "SUPERUSER";
  const canManageBooks = !isReader;
  const canManageAuthorsAndCategories = isMinistryOrSuper || isGovAdmin;

  // Data State
  const [books, setBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filters State
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [governorateFilter, setGovernorateFilter] = useState("all");
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("all"); // "all" | "active" | "archived"
  const [availabilityFilter, setAvailabilityFilter] = useState("all"); // "all" | "available" | "unavailable"

  // Auxiliary data for dropdowns
  const [governorates, setGovernorates] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookToArchive, setBookToArchive] = useState(null);
  const [bookToRestore, setBookToRestore] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  // Quick Inline Creation inside Modals (permitted only for Superuser / Ministry Admin / Gov Admin)
  const [isAddingNewAuthor, setIsAddingNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Add Book Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    author_id: "",
    category_id: "",
    library: "",
    possition: "",
    total_copies: 1,
    pages: "",
    publication_year: new Date().getFullYear(),
    isbn: "",
    description: "",
    image: null,
  });

  // Edit Book Form State
  const [editForm, setEditForm] = useState({
    title: "",
    author_id: "",
    category_id: "",
    possition: "",
    total_copies: 1,
    pages: "",
    publication_year: "",
    isbn: "",
    description: "",
    image: null,
  });

  const [formErrors, setFormErrors] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load auxiliary data (Governorates, Libraries, Authors, Categories)
  useEffect(() => {
    async function loadAuxiliaryData() {
      try {
        const [govsRes, libsRes, authorsRes, catsRes] = await Promise.all([
          authService.getGovernorates().catch(() => []),
          librariesService.getLibraries({ isActive: true, pageSize: 100 }).catch(() => ({ results: [] })),
          authorsService.getAuthors({ pageSize: 100 }).catch(() => ({ results: [] })),
          categoriesService.getDashboardCategories({ pageSize: 100 }).catch(() => ({ results: [] })),
        ]);

        let availableLibs = libsRes?.results || [];

        // Scoping libraries for governorate admin
        if (isGovAdmin && user?.governorate) {
          availableLibs = availableLibs.filter((l) => l.governorate === user.governorate);
        }

        setGovernorates(Array.isArray(govsRes) ? govsRes : govsRes?.data || []);
        setLibraries(availableLibs);
        setAuthors(authorsRes?.results || (Array.isArray(authorsRes) ? authorsRes : []));
        setCategories(catsRes?.results || (Array.isArray(catsRes) ? catsRes : []));
      } catch (err) {
        console.warn("Could not load auxiliary data:", err);
      }
    }

    loadAuxiliaryData();
  }, [isGovAdmin, user?.governorate]);

  // Load books with combined server-side filters & pagination
  const loadBooks = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let isArchivedParam = null;
      if (archiveFilter === "active") isArchivedParam = false;
      if (archiveFilter === "archived") isArchivedParam = true;

      let isAvailableParam = null;
      if (availabilityFilter === "available") isAvailableParam = true;
      if (availabilityFilter === "unavailable") isAvailableParam = false;

      // Positive integer validation for library and governorate
      let safeGovId = null;
      if (governorateFilter !== "all" && governorateFilter !== "" && Number(governorateFilter) > 0) {
        safeGovId = parseInt(governorateFilter, 10);
      }

      let safeLibId = null;
      if (libraryFilter !== "all" && libraryFilter !== "" && Number(libraryFilter) > 0) {
        safeLibId = parseInt(libraryFilter, 10);
      }

      const res = await dashboardBooksService.getBooks({
        page: currentPage,
        pageSize: 10,
        author: authorFilter.trim(),
        category: categoryFilter !== "all" ? categoryFilter.trim() : "",
        governorate: safeGovId,
        library: safeLibId,
        isArchived: isArchivedParam,
        isAvailable: isAvailableParam,
      });

      setBooks(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      if (err.status === 404) {
        setBooks([]);
        setTotalCount(0);
      } else {
        setErrorMessage(err.message || "تعذر جلب قائمة المصنفات، يرجى إعادة المحاولة.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    authorFilter,
    categoryFilter,
    governorateFilter,
    libraryFilter,
    archiveFilter,
    availabilityFilter,
  ]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  // Reset all filters
  const handleResetFilters = () => {
    setAuthorFilter("");
    setCategoryFilter("all");
    setGovernorateFilter("all");
    setLibraryFilter("all");
    setArchiveFilter("all");
    setAvailabilityFilter("all");
    setCurrentPage(1);
  };

  // Quick create Author (only for authorized roles)
  const handleQuickCreateAuthor = async () => {
    if (!canManageAuthorsAndCategories || !newAuthorName.trim()) return;
    try {
      setActionLoading(true);
      const res = await authorsService.createAuthor({ name: newAuthorName.trim() });
      const newAuthor = res?.data || res;
      setAuthors((prev) => [newAuthor, ...prev]);
      if (isAddModalOpen) {
        setCreateForm((prev) => ({ ...prev, author_id: newAuthor.id }));
      } else if (isEditModalOpen) {
        setEditForm((prev) => ({ ...prev, author_id: newAuthor.id }));
      }
      setNewAuthorName("");
      setIsAddingNewAuthor(false);
      showToast(`تمت إضافة المؤلف "${newAuthor.name}" بنجاح.`);
    } catch (err) {
      alert(err.message || "فشلت إضافة المؤلف الجديد.");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick create Category (only for authorized roles)
  const handleQuickCreateCategory = async () => {
    if (!canManageAuthorsAndCategories || !newCategoryName.trim()) return;
    try {
      setActionLoading(true);
      const res = await categoriesService.createCategory({ name: newCategoryName.trim() });
      const newCat = res?.data || res;
      setCategories((prev) => [newCat, ...prev]);
      if (isAddModalOpen) {
        setCreateForm((prev) => ({ ...prev, category_id: newCat.id }));
      } else if (isEditModalOpen) {
        setEditForm((prev) => ({ ...prev, category_id: newCat.id }));
      }
      setNewCategoryName("");
      setIsAddingNewCategory(false);
      showToast(`تمت إضافة التصنيف "${newCat.name}" بنجاح.`);
    } catch (err) {
      alert(err.message || "فشلت إضافة التصنيف الجديد.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenAddModal = () => {
    setFormErrors({});
    setIsAddingNewAuthor(false);
    setIsAddingNewCategory(false);

    let defaultLibrary = "";
    if (isLibrarian && user?.library) {
      defaultLibrary = String(user.library);
    } else if (libraries.length > 0) {
      defaultLibrary = String(libraries[0].id);
    }

    setCreateForm({
      title: "",
      author_id: authors[0]?.id || "",
      category_id: categories[0]?.id || "",
      library: defaultLibrary,
      possition: "",
      total_copies: 1,
      pages: "",
      publication_year: new Date().getFullYear(),
      isbn: "",
      description: "",
      image: null,
    });
    setIsAddModalOpen(true);
  };

  // Handle Add Book Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Client validation
    const errors = {};
    if (!createForm.title.trim()) errors.title = "عنوان المصنف مطلوب.";
    if (!createForm.author_id) errors.author_id = "يرجى تحديد المؤلف.";
    if (!createForm.category_id) errors.category_id = "يرجى تحديد التصنيف.";
    if (!isLibrarian && !createForm.library) errors.library = "يرجى تحديد المكتبة.";
    if (createForm.total_copies === "" || Number(createForm.total_copies) < 0) {
      errors.total_copies = "إجمالي النسخ يجب أن يكون 0 أو أكثر.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        author_id: createForm.author_id,
        category_id: createForm.category_id,
        total_copies: createForm.total_copies,
        possition: createForm.possition.trim(),
        pages: createForm.pages || undefined,
        publication_year: createForm.publication_year || undefined,
        isbn: createForm.isbn.trim() || undefined,
        image: createForm.image,
      };

      if (!isLibrarian) {
        payload.library = createForm.library;
      } else if (user?.library) {
        payload.library = user.library;
      }

      await dashboardBooksService.createBook(payload);
      setIsAddModalOpen(false);
      showToast("تم إدراج المصنف بنجاح في الفهرس المركزي.");
      loadBooks();
    } catch (err) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        alert(err.message || "تعذر إدراج المصنف، يرجى التحقق من المدخلات.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormErrors({});
    setIsAddingNewAuthor(false);
    setIsAddingNewCategory(false);

    setEditForm({
      title: book.title || "",
      author_id: book.author?.id || "",
      category_id: book.category?.id || "",
      possition: book.possition || "",
      total_copies: book.total_copies ?? 1,
      pages: book.pages ?? "",
      publication_year: book.publication_year ?? "",
      isbn: book.isbn || "",
      description: book.description || "",
      image: null,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Book Submit (PATCH)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    setFormErrors({});

    // Client validation for total_copies
    const currentBorrowed = (editingBook.total_copies || 0) - (editingBook.available_copies || 0);
    const newTotal = Number(editForm.total_copies);

    if (newTotal < currentBorrowed) {
      setFormErrors({
        total_copies: `لا يمكن تقليل إجمالي النسخ إلى ${newTotal} لوجود ${currentBorrowed} نسخة مستعارة حالياً.`,
      });
      return;
    }

    try {
      setActionLoading(true);
      const patchData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        author_id: editForm.author_id,
        category_id: editForm.category_id,
        possition: editForm.possition.trim(),
        total_copies: newTotal,
        pages: editForm.pages || undefined,
        publication_year: editForm.publication_year || undefined,
        isbn: editForm.isbn.trim() || undefined,
      };

      if (editForm.image) {
        patchData.image = editForm.image;
      }

      await dashboardBooksService.updateBook(editingBook.id, patchData);
      setIsEditModalOpen(false);
      setEditingBook(null);
      showToast("تم تحديث بيانات المصنف بنجاح.");
      loadBooks();
    } catch (err) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        alert(err.message || "تعذر تحديث المصنف، يرجى التحقق من المدخلات.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Soft Archive (DELETE)
  const handleConfirmArchive = async () => {
    if (!bookToArchive) return;
    try {
      setActionLoading(true);
      await dashboardBooksService.archiveBook(bookToArchive.id);
      setBookToArchive(null);
      showToast(`تمت أرشفة مصنف "${bookToArchive.title}" بنجاح.`);
      loadBooks();
    } catch (err) {
      alert(err.message || "تعذر أرشفة المصنف.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Restore Book (POST /restore/)
  const handleConfirmRestore = async () => {
    if (!bookToRestore) return;
    try {
      setActionLoading(true);
      await dashboardBooksService.restoreBook(bookToRestore.id);
      setBookToRestore(null);
      showToast(`تم إلغاء أرشفة واستعادة مصنف "${bookToRestore.title}" بنجاح.`);
      loadBooks();
    } catch (err) {
      alert(err.message || "تعذر استعادة المصنف.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = async (book) => {
    setViewingBook(book);
    setIsDetailsModalOpen(true);
    try {
      const res = await dashboardBooksService.getBookById(book.id);
      if (res?.data) {
        setViewingBook(res.data);
      }
    } catch {
      // Continue showing passed book object if fetch fails
    }
  };

  // Filtered libraries list for the filter bar
  const filterLibraries = useMemo(() => {
    if (governorateFilter !== "all" && governorateFilter !== "") {
      const govId = Number(governorateFilter);
      return libraries.filter((l) => l.governorate === govId);
    }
    return libraries;
  }, [libraries, governorateFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-6 z-50 p-4 rounded-2xl bg-primary text-white shadow-card flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-secondary" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-bold text-foreground">
              فهرس وإدارة المصنفات والكتب
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary border border-primary/20">
              {roleCode === "MINISTRY_ADMIN" && "نطاق الوزارة الشامل"}
              {roleCode === "SUPERUSER" && "إدارة النظام الكاملة"}
              {roleCode === "GOVERNORATE_ADMIN" && `نطاق المحافظة: ${user?.governorate_name || "محافظتك"}`}
              {roleCode === "LIBRARIAN" && `نطاق المكتبة: ${user?.library_name || "مكتبتك"}`}
              {roleCode === "READER" && "عرض وبحث (للقراءة فقط)"}
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            إدارة الفهرسة الرقمية، تتبع النسخ الفيزيائية والمستعارة، ومتابعة الأرشفة
          </p>
        </div>

        {/* Create Book Button (Hidden for Reader) */}
        {canManageBooks && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover shadow-subtle active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مصنف جديد</span>
          </button>
        )}
      </div>

      {/* Reader Notice Banner */}
      {isReader && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-2xl p-4 flex items-center gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p>
            حسابك مسجل كـ <strong>قارئ</strong>. تتاح لك صلاحية استعراض والبحث في المصنفات النشطة التابعة لمكتبات محافظتك. أدوات الإضافة والتعديل والأرشفة محجوبة.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-subtle space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-primary" />
            فلاتر البحث والاستعلام المتقدمة:
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-foreground-muted hover:text-primary flex items-center gap-1 font-semibold transition-colors"
          >
            <ResetIcon className="w-3 h-3" />
            <span>إعادة تعيين الفلاتر</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Author Name Filter (?author=...) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="text"
              placeholder="اسم المؤلف..."
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl border border-border bg-background ps-8 pe-3 py-2.5 text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category Filter (?category=...) */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Governorate Filter (?governorate=...) for Ministry / Super Admin */}
          {isMinistryOrSuper ? (
            <div>
              <select
                value={governorateFilter}
                onChange={(e) => {
                  setGovernorateFilter(e.target.value);
                  setLibraryFilter("all");
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">جميع المحافظات</option>
                {governorates.map((gov) => (
                  <option key={gov.id} value={gov.id}>
                    {gov.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <input
                type="text"
                disabled
                value={`المحافظة: ${user?.governorate_name || "محافظتك"}`}
                className="w-full text-xs rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-foreground-muted cursor-not-allowed"
              />
            </div>
          )}

          {/* Library Filter (?library=...) */}
          {!isLibrarian ? (
            <div>
              <select
                value={libraryFilter}
                onChange={(e) => {
                  setLibraryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">جميع المكتبات</option>
                {filterLibraries.map((lib) => (
                  <option key={lib.id} value={lib.id}>
                    {lib.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <input
                type="text"
                disabled
                value={`المكتبة: ${user?.library_name || "مكتبتك"}`}
                className="w-full text-xs rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-foreground-muted cursor-not-allowed"
              />
            </div>
          )}

          {/* Archive Status Filter (?is_archived=...) */}
          <div>
            <select
              value={archiveFilter}
              onChange={(e) => {
                setArchiveFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">الأرشفة: الكل</option>
              <option value="active">النشطة فقط</option>
              <option value="archived">المؤرشفة فقط</option>
            </select>
          </div>

          {/* Availability Status Filter (?is_avaiable=...) */}
          <div>
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">التوفر: الكل</option>
              <option value="available">متاح للاستعارة</option>
              <option value="unavailable">غير متوفر (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-error flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-surface rounded-2xl border border-border shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-foreground">
            إجمالي المصنفات المطابقة:{" "}
            <span className="text-primary font-bold">{formatArabicNumber(totalCount)}</span> مصنف
          </span>
          <span className="text-foreground-subtle text-[11px]">
            عرض الصفحة {formatArabicNumber(currentPage)} من {formatArabicNumber(totalPages)} (10 مصنفات في الصفحة)
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-foreground-muted flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>جاري تحميل المصنفات من الفهرس الموحد...</span>
          </div>
        ) : books.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen className="w-10 h-10 text-foreground-subtle mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-foreground">لا توجد مصنفات مطابقة</h4>
            <p className="text-xs text-foreground-muted mt-1">
              لم يتم العثور على أي كتب تطابق معايير التصفية ضمن نطاق صلاحياتك.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-muted/60 text-foreground-subtle font-semibold">
                  <th className="py-3 px-4 text-start">المصنف</th>
                  <th className="py-3 px-4 text-start">المؤلف</th>
                  <th className="py-3 px-4 text-start">التصنيف</th>
                  <th className="py-3 px-4 text-start">المكتبة والموقع</th>
                  <th className="py-3 px-4 text-start">النسخ والاستعارة</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {books.map((book) => {
                  const isAvailable = !!book.is_avaiable;
                  const isArchived = !!book.is_archived;

                  return (
                    <tr
                      key={book.id}
                      className={cn(
                        "hover:bg-surface-muted/40 transition-colors",
                        isArchived && "bg-amber-500/5 opacity-80"
                      )}
                    >
                      {/* Title & Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground max-w-xs truncate flex items-center gap-1.5">
                          <span>{book.title}</span>
                          {isArchived && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              مؤرشف
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-foreground-subtle flex items-center gap-2 mt-0.5">
                          {book.isbn && <span>ISBN: {book.isbn}</span>}
                          {book.publication_year && (
                            <span>• سنة النشر: {formatArabicNumber(book.publication_year)}</span>
                          )}
                          {book.pages && <span>• {formatArabicNumber(book.pages)} صفحة</span>}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 font-medium text-foreground-muted">
                        {book.author?.name || "—"}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary border border-primary/10">
                          {book.category?.name || "عام"}
                        </span>
                      </td>

                      {/* Library & Shelf Position */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-[11px] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>{book.library_name || "المكتبة المركزية"}</span>
                        </div>
                        <div className="text-[10px] text-foreground-subtle flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{book.governorate_name || "المحافظة"}</span>
                          {book.possition && (
                            <span className="font-mono text-[10px] bg-surface-muted px-1 rounded">
                              الرف: {book.possition}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Copies & Borrowing status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span
                            className={cn(
                              "font-bold",
                              book.available_copies > 0 ? "text-emerald-700" : "text-amber-700"
                            )}
                          >
                            {formatArabicNumber(book.available_copies)} متاحة
                          </span>
                          <span className="text-foreground-subtle">
                            / {formatArabicNumber(book.total_copies)} إجمالي
                          </span>
                        </div>
                        <div className="text-[10px] text-foreground-subtle mt-0.5">
                          مستعارة حالياً: {formatArabicNumber(book.count_borrowed || 0)}
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                              isAvailable
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-red-50 text-red-800 border-red-200"
                            )}
                          >
                            {isAvailable ? "متاح" : "غير متاح"}
                          </span>
                          {isArchived ? (
                            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
                              <Archive className="w-2.5 h-2.5" /> مؤرشف
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              نشط
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(book)}
                            title="عرض تفاصيل المصنف"
                            className="p-1.5 rounded-lg text-foreground-muted hover:text-primary hover:bg-primary-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit (Hidden for Reader) */}
                          {canManageBooks && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(book)}
                              title="تعديل بيانات المصنف"
                              className="p-1.5 rounded-lg text-foreground-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Soft Archive (Hidden for Reader, disabled if already archived) */}
                          {canManageBooks && !isArchived && (
                            <button
                              type="button"
                              onClick={() => setBookToArchive(book)}
                              title="أرشفة المصنف (Soft Delete)"
                              className="p-1.5 rounded-lg text-foreground-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Restore (Hidden for Reader, only if archived) */}
                          {canManageBooks && isArchived && (
                            <button
                              type="button"
                              onClick={() => setBookToRestore(book)}
                              title="إلغاء الأرشفة واستعادة المصنف"
                              className="p-1.5 rounded-lg text-foreground-muted hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-foreground-muted">
              الصفحة {formatArabicNumber(currentPage)} من {formatArabicNumber(totalPages)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== ADD BOOK MODAL ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-2xl rounded-3xl border border-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary text-white shadow-subtle">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    إدراج مصنف جديد في الفهرس
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    أدخل بيانات الكتاب والمكتبة والنسخ الفيزيائية المتاحة
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  عنوان المصنف <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فتاوى دمشقية في المعاملات الوقفية"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                {formErrors.title && <p className="text-error text-[11px]">{formErrors.title}</p>}
              </div>

              {/* Author & Category Selection with Inline Quick Adds (Permitted for Super/Ministry/Gov Admin only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Author */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground">
                      المؤلف <span className="text-error">*</span>
                    </label>
                    {canManageAuthorsAndCategories && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAuthor(!isAddingNewAuthor)}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        {isAddingNewAuthor ? "إلغاء" : "+ مؤلف جديد"}
                      </button>
                    )}
                  </div>

                  {isAddingNewAuthor ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="اسم المؤلف الجديد..."
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                        className="flex-1 text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleQuickCreateAuthor}
                        disabled={actionLoading || !newAuthorName.trim()}
                        className="px-3 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover disabled:opacity-40"
                      >
                        حفظ
                      </button>
                    </div>
                  ) : (
                    <select
                      value={createForm.author_id}
                      onChange={(e) => setCreateForm({ ...createForm, author_id: e.target.value })}
                      className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">اختر المؤلف من القائمة</option>
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.author_id && (
                    <p className="text-error text-[11px]">{formErrors.author_id}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground">
                      التصنيف العلمي / الشرعي <span className="text-error">*</span>
                    </label>
                    {canManageAuthorsAndCategories && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        {isAddingNewCategory ? "إلغاء" : "+ تصنيف جديد"}
                      </button>
                    )}
                  </div>

                  {isAddingNewCategory ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="اسم التصنيف الجديد..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleQuickCreateCategory}
                        disabled={actionLoading || !newCategoryName.trim()}
                        className="px-3 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover disabled:opacity-40"
                      >
                        حفظ
                      </button>
                    </div>
                  ) : (
                    <select
                      value={createForm.category_id}
                      onChange={(e) => setCreateForm({ ...createForm, category_id: e.target.value })}
                      className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">اختر التصنيف من القائمة</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.category_id && (
                    <p className="text-error text-[11px]">{formErrors.category_id}</p>
                  )}
                </div>
              </div>

              {/* Library Selection & Total Copies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Library */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    المكتبة المودع بها المصنف <span className="text-error">*</span>
                  </label>
                  {isLibrarian ? (
                    <div className="p-2.5 rounded-xl border border-border bg-surface-muted text-foreground-muted flex items-center justify-between">
                      <span>{user?.library_name || `مكتبتك (معرف: ${user?.library})`}</span>
                      <span className="text-[10px] bg-primary-50 text-primary px-2 py-0.5 rounded font-bold">
                        تلقائي
                      </span>
                    </div>
                  ) : (
                    <select
                      value={createForm.library}
                      onChange={(e) => setCreateForm({ ...createForm, library: e.target.value })}
                      className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">اختر المكتبة النشطة</option>
                      {libraries.map((lib) => (
                        <option key={lib.id} value={lib.id}>
                          {lib.name} ({lib.governorate_name || "محافظة"})
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.library && (
                    <p className="text-error text-[11px]">{formErrors.library}</p>
                  )}
                </div>

                {/* Total Copies */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    إجمالي النسخ الفيزيائية <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={createForm.total_copies}
                    onChange={(e) => setCreateForm({ ...createForm, total_copies: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-foreground-subtle">
                    مسموح 0 (في حال نفاد النسخ). لا يمكن إدخال أرقام سالبة.
                  </p>
                  {formErrors.total_copies && (
                    <p className="text-error text-[11px]">{formErrors.total_copies}</p>
                  )}
                </div>
              </div>

              {/* Shelf Position, Pages, Publication Year, ISBN */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">رمز الرف / الموقع</label>
                  <input
                    type="text"
                    placeholder="مثال: A-10"
                    maxLength={10}
                    value={createForm.possition}
                    onChange={(e) => setCreateForm({ ...createForm, possition: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">عدد الصفحات</label>
                  <input
                    type="number"
                    placeholder="مثال: 250"
                    value={createForm.pages}
                    onChange={(e) => setCreateForm({ ...createForm, pages: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">سنة النشر</label>
                  <input
                    type="number"
                    placeholder="مثال: 2026"
                    value={createForm.publication_year}
                    onChange={(e) => setCreateForm({ ...createForm, publication_year: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">الرقم الدولي (ISBN)</label>
                  <input
                    type="text"
                    placeholder="978-..."
                    maxLength={15}
                    value={createForm.isbn}
                    onChange={(e) => setCreateForm({ ...createForm, isbn: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">نبذة توثيقية عن المصنف</label>
                <textarea
                  rows={3}
                  placeholder="وصف مختصر لمحتوى الكتاب وموضوعاته..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">صورة الغلاف (اختياري)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateForm({ ...createForm, image: e.target.files[0] || null })}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-surface-muted transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors font-bold shadow-subtle disabled:opacity-50"
                >
                  {actionLoading ? "جاري الحفظ..." : "اعتماد وإدراج المصنف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT BOOK MODAL (PATCH) ===================== */}
      {isEditModalOpen && editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-2xl rounded-3xl border border-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-subtle">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    تعديل بيانات المصنف (معرف: {editingBook.id})
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    تعديل الحقول المسموحة عبر عملية جزئية (PATCH) مع تثبيت المكتبة
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fixed Scope Notice */}
            <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between text-xs mb-4">
              <span className="text-foreground-muted flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                المكتبة التابع لها: <strong>{editingBook.library_name}</strong> ({editingBook.governorate_name})
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                ثابتة ولا تقبل النقل
              </span>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  عنوان المصنف <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-xs rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                />
                {formErrors.title && <p className="text-error text-[11px]">{formErrors.title}</p>}
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">المؤلف</label>
                  <select
                    value={editForm.author_id}
                    onChange={(e) => setEditForm({ ...editForm, author_id: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                  >
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">التصنيف</label>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-primary focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Copies & Shelf Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    إجمالي النسخ الفيزيائية <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.total_copies}
                    onChange={(e) => setEditForm({ ...editForm, total_copies: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                  />
                  <div className="text-[10px] text-foreground-subtle flex items-center justify-between">
                    <span>النسخ المستعارة حالياً: {formatArabicNumber(editingBook.count_borrowed || 0)}</span>
                    <span className="text-primary">المتاحة: {formatArabicNumber(editingBook.available_copies || 0)}</span>
                  </div>
                  {formErrors.total_copies && (
                    <p className="text-error text-[11px] font-semibold">{formErrors.total_copies}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">رمز الرف / الموقع (possition)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editForm.possition}
                    onChange={(e) => setEditForm({ ...editForm, possition: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Pages, Year, ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">عدد الصفحات</label>
                  <input
                    type="number"
                    value={editForm.pages}
                    onChange={(e) => setEditForm({ ...editForm, pages: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">سنة النشر</label>
                  <input
                    type="number"
                    value={editForm.publication_year}
                    onChange={(e) => setEditForm({ ...editForm, publication_year: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">الرقم الدولي (ISBN)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={editForm.isbn}
                    onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">النبذة التوثيقية</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Optional image replacement */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">تحديث صورة الغلاف (اختياري)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] || null })}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-surface-muted transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-bold shadow-subtle disabled:opacity-50"
                >
                  {actionLoading ? "جاري الحفظ..." : "تحديث المصنف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== VIEW DETAILS MODAL ===================== */}
      {isDetailsModalOpen && viewingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-xl rounded-3xl border border-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-50 text-primary border border-primary/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">بطاقة الفهرسة الكاملة</h3>
                  <p className="text-xs text-foreground-muted">معرف السجل: {viewingBook.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Header Title & Badges */}
              <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-foreground">{viewingBook.title}</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-white">
                    {viewingBook.category?.name || "عام"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary-50 text-secondary-hover border border-secondary/20">
                    المؤلف: {viewingBook.author?.name || "مجهول"}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      viewingBook.is_archived
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    )}
                  >
                    {viewingBook.is_archived ? "مؤرشف" : "سجل نشط"}
                  </span>
                </div>
              </div>

              {/* Physical Inventory Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-surface rounded-2xl border border-border text-center">
                <div className="p-2 rounded-xl bg-surface-muted">
                  <div className="text-[10px] text-foreground-muted">إجمالي النسخ</div>
                  <div className="text-base font-extrabold text-foreground mt-0.5">
                    {formatArabicNumber(viewingBook.total_copies)}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <div className="text-[10px]">النسخ المتاحة</div>
                  <div className="text-base font-extrabold mt-0.5">
                    {formatArabicNumber(viewingBook.available_copies)}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-surface-muted">
                  <div className="text-[10px] text-foreground-muted">المستعارة حالياً</div>
                  <div className="text-base font-extrabold text-secondary-hover mt-0.5">
                    {formatArabicNumber(viewingBook.count_borrowed || 0)}
                  </div>
                </div>
              </div>

              {/* Location & Meta info */}
              <div className="space-y-2 p-3.5 bg-surface rounded-2xl border border-border">
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-foreground-muted">المكتبة:</span>
                  <span className="font-semibold text-foreground">{viewingBook.library_name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-foreground-muted">المحافظة:</span>
                  <span className="font-semibold text-foreground">{viewingBook.governorate_name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-foreground-muted">موقع الرف الفيزيائي:</span>
                  <span className="font-mono font-bold text-foreground">
                    {viewingBook.possition || "غير محدد"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-foreground-muted">الرقم الدولي (ISBN):</span>
                  <span className="font-mono text-foreground">{viewingBook.isbn || "غير متوفر"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-foreground-muted">سنة النشر:</span>
                  <span className="text-foreground">
                    {viewingBook.publication_year ? `${viewingBook.publication_year} م` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-foreground-muted">عدد الصفحات:</span>
                  <span className="text-foreground">
                    {viewingBook.pages ? `${viewingBook.pages} صفحة` : "—"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {viewingBook.description && (
                <div className="space-y-1 p-3.5 bg-surface-muted/30 rounded-2xl border border-border">
                  <span className="font-bold text-foreground">الوصف والنبذة:</span>
                  <p className="text-xs text-foreground-muted leading-relaxed whitespace-pre-wrap">
                    {viewingBook.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-muted text-foreground hover:bg-surface-muted/80 font-medium"
                >
                  إغلاق
                </button>
                {canManageBooks && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenEditModal(viewingBook);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold"
                  >
                    تعديل البيانات
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ARCHIVE CONFIRMATION MODAL ===================== */}
      {bookToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  تأكيد أرشفة المصنف
                </h3>
                <p className="text-xs text-foreground-muted">أرشفة هادئة (Soft Archive)</p>
              </div>
            </div>

            <p className="text-xs text-foreground-muted leading-relaxed">
              هل أنت متأكد من رغبتك في أرشفة المصنف{" "}
              <strong className="text-foreground">"{bookToArchive.title}"</strong>؟
            </p>

            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                تنبيه نظام الأرشفة:
              </div>
              <p>
                الأرشفة لا تحذف الكتاب من قاعدة البيانات، بل تقوم بتحويل حالته إلى مؤرشف. يتم الحفاظ على عدد النسخ الفيزيائية وسجل الإعارات، ويمكن استعادته في أي وقت.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBookToArchive(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-surface-muted font-medium text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-bold text-xs shadow-subtle disabled:opacity-50"
              >
                {actionLoading ? "جاري الأرشفة..." : "تأكيد الأرشفة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== RESTORE CONFIRMATION MODAL ===================== */}
      {bookToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  تأكيد استعادة المصنف
                </h3>
                <p className="text-xs text-foreground-muted">إلغاء الأرشفة وإعادته للفهرس النشط</p>
              </div>
            </div>

            <p className="text-xs text-foreground-muted leading-relaxed">
              هل ترغب في إلغاء أرشفة المصنف{" "}
              <strong className="text-foreground">"{bookToRestore.title}"</strong> وإعادته إلى الفهرس الفعال؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBookToRestore(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-surface-muted font-medium text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-subtle disabled:opacity-50"
              >
                {actionLoading ? "جاري الاستعادة..." : "تأكيد الاستعادة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
