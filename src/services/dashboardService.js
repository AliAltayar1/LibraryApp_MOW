import { MOCK_BOOKS } from "@/data/mockBooks";
import { MOCK_CATEGORIES } from "@/data/mockCategories";
import { ROLES } from "@/lib/constants";
import { userManagementService } from "./userManagementService";
import { dashboardBooksService } from "./dashboardBooksService";

// Simulated in-memory storage for dashboard operations
let booksData = [...MOCK_BOOKS];

export const MOCK_USERS = [
  {
    id: "usr-01",
    name: "د. عبد الرزاق الحلبي",
    username: "abdulrazaq_mow",
    email: "a.halabi@mow.gov.sy",
    role: ROLES.SUPERUSER.label,
    roleCode: ROLES.SUPERUSER.code,
    department: "الإدارة العامة للمعلوماتية والتوثيق",
    status: "active",
    joinedDate: "2023-01-15",
    booksAdded: 142,
  },
  {
    id: "usr-02",
    name: "الشيخ نور الدين قاسم",
    username: "nour_qasim",
    email: "n.qasim@mow.gov.sy",
    role: ROLES.MINISTRY_ADMIN.label,
    roleCode: ROLES.MINISTRY_ADMIN.code,
    department: "مديرية المخطوطات والآثار الوقفية",
    status: "active",
    joinedDate: "2023-04-10",
    booksAdded: 89,
  },
  {
    id: "usr-03",
    name: "أ. سهام الخيمي",
    username: "siham_kheimi",
    email: "s.kheimi@mow.gov.sy",
    role: ROLES.LIBRARIAN.label,
    roleCode: ROLES.LIBRARIAN.code,
    department: "شعبة الفهرسة والتصنيف الرقمي",
    status: "active",
    joinedDate: "2023-09-01",
    booksAdded: 215,
  },
  {
    id: "usr-04",
    name: "أ. محمود الطباع",
    username: "mahmoud_tebbaa",
    email: "m.tabbaa@damascus-endow.sy",
    role: ROLES.GOVERNORATE_ADMIN.label,
    roleCode: ROLES.GOVERNORATE_ADMIN.code,
    department: "أوقاف دمشق وريفها",
    status: "active",
    joinedDate: "2024-02-18",
    booksAdded: 54,
  },
  {
    id: "usr-05",
    name: "د. طارق الحكيم",
    username: "tariq_hakim",
    email: "t.hakim@univ-damas.edu.sy",
    role: ROLES.READER.label,
    roleCode: ROLES.READER.code,
    department: "باحث أكاديمي - جامعة دمشق",
    status: "active",
    joinedDate: "2024-05-12",
    booksAdded: 0,
  },
];

export const MOCK_DASHBOARD_ACTIVITY = [
  {
    id: "act-1",
    type: "upload",
    title: "إدراج مخطوطة وقفية جديدة",
    target: "شرح المنار في أصول الفقه (نسخة خزائنية دمشقية)",
    user: "الشيخ نور الدين قاسم",
    department: "مديرية المخطوطات",
    time: "منذ ١٥ دقيقة",
    badge: "مخطوطة",
  },
  {
    id: "act-2",
    type: "audit",
    title: "اعتماد تدقيق كتاب ونشره رسمياً",
    target: "الموافقات في أصول الشريعة - المجلد الثاني",
    user: "أ. سهام الخيمي",
    department: "شعبة الفهرسة والتصنيف",
    time: "منذ ساعتين",
    badge: "مراجعة",
  },
  {
    id: "act-3",
    type: "user",
    title: "منح صلاحية تدقيق لباحث جديد",
    target: "د. طارق الحكيم - باحث أكاديمي",
    user: "د. عبد الرزاق الحلبي",
    department: "إدارة النظام",
    time: "منذ ٤ ساعات",
    badge: "صلاحيات",
  },
  {
    id: "act-4",
    type: "stats",
    title: "تجاوز حاجز ٥٠,٠٠٠ قراءة رقمية",
    target: "كتاب رياض الصالحين للإمام النووي",
    user: "النظام الآلي",
    department: "الخادم السحابي",
    time: "أمس في ٠٨:٣٠ م",
    badge: "إحصائية",
  },
  {
    id: "act-5",
    type: "backup",
    title: "اكتمال النسخ الاحتياطي للأرشيف الرقمي",
    target: "مركز بيانات دمشق الحكومي (سعة ٤٢.٨ جيجابايت)",
    user: "النظام الآلي",
    department: "أمن المعلومات",
    time: "أمس في ٠٣:٠٠ ص",
    badge: "نظام",
  },
];

export const dashboardService = {
  /**
   * Fetch core KPI metrics for dashboard home
   */
  async getOverviewStats() {
    return {
      totalBooks: {
        value: 12450,
        formatted: "١٢,٤٥٠",
        change: "+8.4%",
        trend: "up",
        label: "إجمالي المصنفات الرقمية",
        subLabel: "شاملة المطبوعات والرسائل",
      },
      manuscripts: {
        value: 3820,
        formatted: "٣,٨٢٠",
        change: "+12.1%",
        trend: "up",
        label: "المخطوطات والنفائس الوقفية",
        subLabel: "مرقمنة بدقة فائقة 4K",
      },
      registeredResearchers: {
        value: 45210,
        formatted: "٤٥,٢١٠",
        change: "+15.3%",
        trend: "up",
        label: "الباحثون وطلاب العلم",
        subLabel: "مستفيدون مسجلون وموثقون",
      },
      totalDownloads: {
        value: 184500,
        formatted: "١٨٤,٥٠٠",
        change: "+22.5%",
        trend: "up",
        label: "عمليات التنزيل والمطالعة",
        subLabel: "خلال الربع السنوي الحالي",
      },
      pendingReviews: {
        value: 14,
        formatted: "١٤",
        change: "-3",
        trend: "down",
        label: "مصنفات بانتظار التدقيق والاعتماد",
        subLabel: "تتطلب مراجعة أمين المكتبة",
      },
      storageUsedGb: 42.8,
      storageTotalGb: 100,
    };
  },

  /**
   * Fetch categories breakdown with percentages and counts
   */
  async getCategoriesDistribution() {
    const total = MOCK_CATEGORIES.reduce((acc, c) => acc + c.count, 0);
    return MOCK_CATEGORIES.map((cat) => ({
      ...cat,
      percentage: Math.round((cat.count / total) * 100),
    }));
  },

  /**
   * Fetch system recent activities
   */
  async getRecentActivities() {
    return MOCK_DASHBOARD_ACTIVITY;
  },

  /**
   * Fetch books with dashboard-specific pagination and search
   */
  async getDashboardBooks({
    query = "",
    category = "all",
    format = "all",
    status = "all",
    page = 1,
    pageSize = 10,
  } = {}) {
    try {
      const res = await dashboardBooksService.getBooks({
        page,
        pageSize: Math.min(pageSize, 10),
        category: category !== "all" ? category : "",
      });
      if (res && Array.isArray(res.results) && res.results.length > 0) {
        return {
          items: res.results.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author?.name || "مجهول",
            category: b.category?.name || "عام",
            categorySlug: "general",
            year: b.publication_year ? `${b.publication_year} م` : "—",
            format: "pdf",
            viewsCount: 0,
            downloadsCount: b.count_borrowed || 0,
            isbn: b.isbn || "",
            possition: b.possition || "",
            total_copies: b.total_copies,
            available_copies: b.available_copies,
            count_borrowed: b.count_borrowed,
            is_avaiable: b.is_avaiable,
            is_archived: b.is_archived,
            library_name: b.library_name,
            governorate_name: b.governorate_name,
          })),
          total: res.count,
          page,
          totalPages: Math.ceil(res.count / pageSize) || 1,
        };
      }
    } catch {
      // Fallback to mock data if unauthenticated or offline
    }

    let list = [...booksData];

    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    if (category && category !== "all") {
      list = list.filter((b) => b.categorySlug === category || b.category === category);
    }

    if (format && format !== "all") {
      list = list.filter((b) => b.format === format);
    }

    const total = list.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paged = list.slice(startIndex, startIndex + pageSize);

    return {
      items: paged,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Add a new book to the library
   */
  async addBook(newBook) {
    const id = String(Date.now());
    const bookEntry = {
      id,
      title: newBook.title,
      author: newBook.author,
      category: newBook.category || "علوم القرآن والتفسير",
      categorySlug: newBook.categorySlug || "quran-sciences",
      year: newBook.year || "١٤٤٥ هـ",
      gregorianYear: Number(newBook.gregorianYear) || 2024,
      pages: Number(newBook.pages) || 250,
      language: newBook.language || "العربية",
      format: newBook.format || "pdf",
      formatLabel: newBook.format === "manuscript" ? "مخطوطة نادرة" : "مطبوع محقق (PDF)",
      description: newBook.description || "كتاب قيم تم إدراجه حديثاً ضمن المنصة الرقمية الموحدة.",
      publisher: newBook.publisher || "وزارة الأوقاف السورية",
      isbn: newBook.isbn || `978-9933-${Math.floor(1000 + Math.random() * 9000)}-1`,
      rating: 5.0,
      reviewsCount: 1,
      viewsCount: 0,
      downloadsCount: 0,
      isFeatured: !!newBook.isFeatured,
      isPopular: false,
      isRecent: true,
      coverTheme: {
        palette: "emerald",
        bgGradient: "from-[#0d4a37] to-[#06291e]",
        accentColor: "#c29b38",
        patternType: "arabesque",
      },
    };

    booksData = [bookEntry, ...booksData];
    return bookEntry;
  },

  /**
   * Delete a book by ID
   */
  async deleteBook(id) {
    booksData = booksData.filter((b) => String(b.id) !== String(id));
    return true;
  },

  /**
   * Fetch registered system users
   */
  async getUsers() {
    try {
      const liveUsers = await userManagementService.getUsers();
      if (Array.isArray(liveUsers) && liveUsers.length > 0) {
        return liveUsers;
      }
    } catch {
      // Fallback if not authenticated
    }
    return MOCK_USERS;
  },

  /**
   * Analytics breakdown by Syrian governorates & reading trends
   */
  async getAnalyticsData() {
    return {
      monthlyActivity: [
        { month: "كانون الثاني", views: 24500, downloads: 8200 },
        { month: "شباط", views: 28900, downloads: 9700 },
        { month: "آذار", views: 34100, downloads: 11400 },
        { month: "نيسان", views: 39500, downloads: 13200 },
        { month: "أيار", views: 42000, downloads: 14800 },
        { month: "حزيران", views: 46800, downloads: 16500 },
      ],
      governorateDistribution: [
        { governorate: "دمشق وريفها", count: 18500, percentage: 41 },
        { governorate: "حلب", count: 10200, percentage: 23 },
        { governorate: "حمص وحماة", count: 7400, percentage: 16 },
        { governorate: "اللاذقية وطرطوس", count: 5200, percentage: 12 },
        { governorate: "باقي المحافظات والمشاركات الخارجية", count: 3910, percentage: 8 },
      ],
      manuscriptsDigitizationGoal: {
        target: 5000,
        completed: 3820,
        inProgress: 640,
        percentage: 76,
      },
    };
  },
};
