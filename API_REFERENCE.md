📘 وثائق freelr WebAPI - التوثيق الكامل

Base URL: /api/v1/ Authentication: JWT Bearer Token (يُرسل في Header كـ Authorization: Bearer <token>)

🔐 Auth — المصادقة وإدارة الحساب

[POST] /api/v1/auth/login
الوظيفة: تسجيل دخول المستخدم والحصول على التوكن. Authentication: ❌ غير مطلوب (AllowAnonymous) البيانات المطلوبة (Request Body):

JSON



{  "email": "user@example.com",  "password": "Password123!"}
البيانات المرجعة (Response 200 OK):

JSON



{  "token": "JWT_ACCESS_TOKEN",  "refreshToken": "uuid-string",  "expiresAt": "2026-04-27T10:00:00Z",  "permissions": ["Invoices.Read", "Invoices.Write"]}
[POST] /api/v1/auth/register
الوظيفة: تسجيل حساب جديد في النظام. Authentication: ❌ غير مطلوب البيانات المطلوبة (Request Body):

JSON



{  "firstName": "Ahmed",  "lastName": "Ali",  "email": "ahmed@example.com",  "phoneNumber": "+966500000000",  "password": "StrongPassword123!"}
البيانات المرجعة (Response): 201 Created (بدون Body)

🏢 Business — إدارة المنشأة

[GET] /api/v1/business?ownerId={ownerId}
الوظيفة: جلب بيانات المنشأة الخاصة بالمستخدم. Authentication: ✅ مطلوب البيانات المطلوبة (Query Parameter):

ownerId (Guid) — معرف مالك المنشأة. البيانات المرجعة (Response 200 OK):
JSON



{  "id": "guid",  "name": "اسم الشركة",  "industry": "Retail",  "currency": "SAR",  "logoUrl": "string | null",  "address": "string",  "phone": "string"}
👥 Clients — إدارة العملاء

[GET] /api/v1/clients?businessId={businessId}
الوظيفة: جلب قائمة جميع العملاء لمنشأة معينة. Authentication: ✅ مطلوب البيانات المرجعة (Response 200 OK):

JSON



[  {    "id": "guid",    "fullName": "اسم العميل",    "email": "client@example.com",    "phone": "050...",    "company": "اسم الشركة"  }]
[POST] /api/v1/clients
الوظيفة: إضافة عميل جديد. البيانات المطلوبة (Request Body):

JSON



{  "businessId": "guid",  "firstName": "string",  "lastName": "string",  "email": "string",  "phone": "string",  "company": "string",  "address": "string"}
📄 Invoices — إدارة الفواتير

[GET] /api/v1/invoices?businessId={businessId}
الوظيفة: جلب جميع فواتير المنشأة. Authentication: ✅ مطلوب البيانات المرجعة (Response 200 OK):

JSON



[  {    "id": "guid",    "invoiceNumber": "INV-2024-001",    "status": "Draft | Sent | Paid | Overdue",    "total": 1500.00,    "balanceDue": 500.00,    "dueDate": "2026-05-20"  }]
[POST] /api/v1/invoices/{id}/payment
الوظيفة: تسجيل عملية دفع لفاتورة معينة. البيانات المطلوبة (Request Body):

JSON



{  "businessId": "guid",  "amount": 500.00,  "paymentDate": "2026-04-27",  "paymentMethod": 1,  "transactionId": "TXN_123",  "notes": "دفعة جزئية"}
ملاحظة: paymentMethod انظر قسم Enums بالأسفل.

💰 Finance — الدخل والمصاريف

[GET] /api/v1/income?businessId={businessId}&from={date}&to={date}
الوظيفة: جلب حركات الدخل مع فلترة بالتاريخ. البيانات المرجعة (Response 200 OK):

JSON



[  {    "id": "guid",    "amount": 2500.00,    "source": "Sales",    "incomeDate": "2026-04-20"  }]
[POST] /api/v1/expenses/{id}/receipt
الوظيفة: رفع صورة الإيصال لمصروف معين. Request: multipart/form-data البيانات المرجعة: { "receiptUrl": "https://..." }

📊 Analytics — التحليلات والتوقعات

[GET] /api/v1/dashboard/overview?businessId={guid}
الوظيفة: جلب ملخص الأداء المالي (KPIs). البيانات المرجعة:

JSON



{  "totalIncome": 50000.00,  "totalExpenses": 20000.00,  "netCashflow": 30000.00,  "unpaidInvoicesTotal": 5000.00,  "unreadAlertsCount": 3}
[POST] /api/v1/forecast/generate
الوظيفة: إنشاء توقعات التدفق النقدي للأشهر القادمة باستخدام الذكاء الاصطناعي. البيانات المرجعة:

JSON



{  "forecastId": "guid",  "expectedIncome": 15000.00,  "riskLevel": "Low",  "recommendations": ["قلل المصاريف الإدارية", "اتبع سياسة تحصيل أسرع"]}
🛡️ Roles — إدارة الأدوار

[GET] /api/v1/roles
الوظيفة: جلب جميع الأدوار في النظام (Admin, User, etc).

🏷️ البيانات الثابتة (Enums) للـ Frontend

Enum	القيمة: المعنى
InvoiceStatus	0: Draft, 1: Sent, 2: Paid, 3: PartiallyPaid, 4: Overdue, 5: Cancelled
PaymentMethod	0: Cash, 1: BankTransfer, 2: CreditCard, 5: OnlinePayment, 6: Crypto
RiskLevel	0: Low, 1: Medium, 2: High, 3: Critical
💡 ملاحظات عامة:

جميع التواريخ تُرسل وتُستقبل بصيغة ISO 8601 (مثال: 2026-04-27).
في حال حدوث خطأ، الـ API يرجع ProblemDetails تحتوي على title و detail و errors في حال كانت مشكلة Validation.
التوكن (JWT) يجب إرساله في كل طلب يتطلب Authentication: ✅ مطلوب.
هذا المستند جاهز للاستخدام في Wiki المشروع.