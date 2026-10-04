# المنصة الرقمية للمكتبة الإلكترونية | وزارة الأوقاف السورية
### Syrian Ministry of Endowments — Digital Library Platform

مشروع واجهة أمامية (Frontend) متكامل وعالي الأداء تم بناؤه بأحدث المعايير البرمجية ليكون المنصة الرقمية الموحدة للمخطوطات والكتب والدراسات الإسلامية والوقفية والتاريخية لوزارة الأوقاف في الجمهورية العربية السورية.

---

## 🏛️ الهوية البصرية وفلسفة التصميم (Design System)

تم استلهام الهوية البصرية من الهوية الرسمية الحالية لوزارة الأوقاف السورية مع تطويعها لبيئة المكتبات الرقمية الأكاديمية الحديثة:
* **الأخضر السيادي العميق (`--color-primary: #0d4a37`)**: يمثل اللون المؤسسي المعتمد للوزارة، ويبعث على الوقار والرصانة والأصالة.
* **الذهب العتيق المكرر (`--color-secondary: #c29b38`)**: يُستخدم بلمسات دقيقة ومحسوبة لإبراز الإشارات المرجعية، والتقييمات، وحالات الاختيار، دون بهرجة أو مبالغة زخرفية.
* **خلفيات العاج الدافئ (`--color-background: #fafaf7`)**: توفر راحة تامة للعين أثناء فترات القراءة والمطالعة الطويلة.
* **الطباعة العربية الرصينة**: مبنية على خط **Cairo** المعتمد مع هرمية متناسقة للعناوين والمتون والنصوص الفائقة.
* **دعم كامل ومحكم للاتجاه من اليمين إلى اليسار (RTL-First)**: تطبيق الخصائص المنطقية (CSS Logical Properties) وضبط اتجاهات الأسهم وأدوات التصفح ومسار التنقل.

---

## 🏗️ الهيكلية المعمارية (Feature-Oriented Architecture)

تم تجنب الملفات الضخمة (Monolithic Components)؛ حيث بُني كل مسار من مكونات قطاعية مستقلة قابلة لإعادة الاستخدام والصيانة:

```
src/
├── app/                      # مسارات Next.js App Router (RTL & Server Components)
│   ├── layout.jsx            # القالب العام وتضمين الخط والترويسة والتذييل
│   ├── page.jsx              # الصفحة الرئيسية (Hero, Categories, Books, Stats)
│   ├── not-found.jsx         # صفحة الخطأ 404 المؤسسية
│   ├── books/
│   │   ├── page.jsx          # صفحة استكشاف وفهرسة الكتب
│   │   └── [id]/page.jsx     # صفحة تفاصيل الكتاب والمراجع ذات الصلة
│   ├── favorites/
│   │   └── page.jsx          # صفحة الكتب المحفوظة والمفضلة
│   └── profile/
│       └── page.jsx          # صفحة الملف الشخصي للباحث وسجل النشاط
├── components/
│   ├── ui/                   # العناصر التأسيسية (Button, Input, Badge, Card, Avatar, Skeleton, Tabs)
│   ├── shared/               # المكونات المشتركة (MinistryLogo, Container, SectionHeader, EmptyState, RatingStars, Breadcrumbs, Pagination)
│   ├── layout/               # ترويسة الموقع، التذييل الرسمي، القائمة المتنقلة، وقائمة المستخدم
│   ├── books/                # بطاقة الكتاب BookCard، الغلاف الجلدي التراثي BookCover، الفلاتر، وشاشة الاستكشاف
│   ├── home/                 # قطاعات الصفحة الرئيسية (Hero, Stats, Categories, Highlights)
│   ├── favorites/            # إدارة المفضلة والبحث في المحفوظات
│   └── profile/              # بيانات الباحث، الإحصائيات، وسجل القراءة
├── services/                 # طبقة الخدمات المهيأة لربط واجهات Django API
│   ├── booksService.js       # خدمات البحث والتصفية وجلب تفاصيل الكتب
│   ├── categoriesService.js  # جلب التصنيفات وفروع العلم
│   ├── favoritesService.js   # إدارة وتخزين المراجع المفضلة
│   └── userService.js        # جلب بيانات الباحث والأنشطة الأكاديمية
├── data/                     # بيانات وهمية عربية واقعية وأصيلة (كتب الفقه، التفسير، الحديث، والوقف)
├── hooks/                    # خطافات مخصصة (useFavorites) لمزامنة حالات التفاعل
├── lib/                      # دوال مساعدة (cn, formatArabicNumber) والثوابت
└── styles/                   # متغيرات نظام التصميم CSS Variables وTailwind CSS
```

---

## 🔌 دليل مهندس الواجهة الخلفية (Backend / Django Integration Guide)

تم فصل طبقة البيانات والخدمات تماماً عن واجهات المستخدم. لربط تطبيق Django (عبر Django REST Framework أو Django Ninja)، يكفي تعديل ملفات مجلد `src/services/` دون الحاجة إلى إعادة كتابة مكونات الـ UI:

| ملف الخدمة | الدالة المستهدفة | نقطة النهاية المقترحة في Django |
| :--- | :--- | :--- |
| `booksService.js` | `getBooks(params)` | `GET /api/v1/books/?q=&category=&sort=&page=` |
| `booksService.js` | `getBookById(id)` | `GET /api/v1/books/<id>/` |
| `booksService.js` | `getRelatedBooks(...)` | `GET /api/v1/books/<id>/related/` |
| `categoriesService.js` | `getCategories()` | `GET /api/v1/categories/` |
| `favoritesService.js` | `toggleFavorite(id)` | `POST /api/v1/favorites/toggle/` |
| `userService.js` | `getCurrentUser()` | `GET /api/v1/users/me/` |

---

## 🏛️ تغيير شعار الوزارة (Ministry Logo Asset Swap)

تم تصميم مكون الشعار `<MinistryLogo />` ليكون مستقلاً تماماً:
* لاستبدال الشعار الرمزي بالشعار الرسمي، ضع ملف الـ SVG أو PNG داخل مجلد `public/images/logo.svg`.
* افتح الملف: `src/components/shared/MinistryLogo.jsx`.
* عدّل المتغير `LOGO_ASSET_PATH`:
  ```javascript
  const LOGO_ASSET_PATH = "/images/logo.svg";
  ```
يتكفل المكون تلقائياً بضبط التنسيقات في الترويسة والتذييل والقائمة المتنقلة دون أي تعديل إضافي.

---

## 🚀 التشغيل والتطوير (Getting Started)

### تشغيل خادم التطوير:
```bash
npm run dev
```
افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

### بناء المشروع للإنتاج:
```bash
npm run build
```

### تشغيل خادم الإنتاج:
```bash
npm run start
```
