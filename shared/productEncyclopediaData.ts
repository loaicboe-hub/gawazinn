import type {
  AlternativeRelationType,
  MerchantWarrantyType,
  Product,
  ProductComparisonMatrixPayload,
  ProductMerchantOffer,
  ProductPricePoint,
} from './types';

export interface ProductEncyclopediaMetadata {
  slug: string;
  model: string;
  dimensions: string;
  capacity: string;
  energyRating: string;
  warrantyMonths: number;
  warrantyTermsAr: string;
  warrantyTermsEn: string;
  originCountryAr: string;
  originCountryEn: string;
  prosAr: string[];
  prosEn: string[];
  consAr: string[];
  consEn: string[];
  buyerWarningsAr: string[];
  buyerWarningsEn: string[];
  recommendedForAr: string;
  recommendedForEn: string;
}

export const PRODUCT_ENCYCLOPEDIA_EXTENSIONS: Record<string, ProductEncyclopediaMetadata> = {
  'groom-p1': {
    slug: 'sharp-450l-inverter-fridge',
    model: 'SJ-PV58G-BK',
    dimensions: '177 × 70 × 72 cm',
    capacity: '450 L',
    energyRating: 'A+',
    warrantyMonths: 120,
    warrantyTermsAr: 'ضمان 10 سنوات شامل على الكمبريسور والهيكل الداخلي من مجموعة العربي بشرط التركيب أو التفعيل الهاتفي عبر 19319.',
    warrantyTermsEn: '10-year official El-Araby warranty on inverter compressor and cabinet; activate via 19319 upon delivery.',
    originCountryAr: 'تجميع مصري (ترخيص شارب اليابان)',
    originCountryEn: 'Egypt Assembly (Sharp Japan License)',
    prosAr: [
      'تنقية البلازما كلاستر تقلل روائح الثلاجة وتحفظ الخضروات أطول فترة',
      'شبكة قطع غيار وصيانة منتشرة في جميع المحافظات المصرية',
      'تتحمل تذبذب الكهرباء حتى 185 فولت مع يونت حماية إنفرتر مدمجة',
    ],
    prosEn: [
      'Plasmacluster air purification extends fresh produce shelf life',
      'Wide nationwide spare-parts & service center availability across Egypt',
      'J-Tech Inverter handles voltage fluctuations efficiently',
    ],
    consAr: [
      'السطح الزجاجي الأسود يظهر بصمات اليد ويحتاج مسحاً دورياً',
      'عمق 72 سم يتطلب قياس باب الشقة والمطبخ قبل الشراء',
    ],
    consEn: [
      'Glossy glass black door shows fingerprints easily',
      '72 cm depth requires checking apartment entrance & kitchen doorway width',
    ],
    buyerWarningsAr: [
      'تأكد أن عرض باب المطبخ أكبر من 73 سم أو جهز لفك الأبواب مع فني الوكيل',
      'اترك مسافة 10 سم خلف الثلاجة وجانبيها للتهوية وحافظ على عدم توصيلها إلا بعد 6 ساعات من النقل',
    ],
    buyerWarningsEn: [
      'Verify kitchen door clearance > 73 cm or schedule hinge removal with agent technician',
      'Leave 10 cm rear ventilation clearance and wait 6 hours upright after transport before powering on',
    ],
    recommendedForAr: 'الشقق العصرية من 100 إلى 180 م² والراغبين في أفضل توازن بين الضمان وقطع الغيار',
    recommendedForEn: 'Modern 100–180m² apartments seeking maximum spare-parts peace of mind',
  },
  'groom-p2': {
    slug: 'lg-9kg-ai-dd-steam-washer',
    model: 'F4V5RGP2T',
    dimensions: '85 × 60 × 56 cm',
    capacity: '9 KG',
    energyRating: 'A+++',
    warrantyMonths: 120,
    warrantyTermsAr: 'ضمان 10 سنوات على موتور الدفع المباشر وسنتان شامل على القطع من إل جي مصر (يُشترط تركيب فني الوكيل لتفعيل الضمان).',
    warrantyTermsEn: '10-year Direct Drive motor warranty & 2-year full coverage from LG Egypt (agent installation required).',
    originCountryAr: 'تجميع مصري (العاشر من رمضان)',
    originCountryEn: 'Made in Egypt (10th of Ramadan Plant)',
    prosAr: [
      'موتور Direct Drive بدون سير يقلل الضوضاء والاهتزاز أثناء العصر 1400 لفة',
      'دورة البخار Steam تقضي على مسببات الحساسية وتناسب ملابس الأطفال والأسر الجديدة',
      'إمكانية إضافة قطع ملابس بعد بدء الدورة Add Item',
    ],
    prosEn: [
      'Beltless Direct Drive motor minimizes noise and vibration at 1400 RPM',
      'Steam hygiene cycle removes allergens effectively for households',
      'Add-Item pause functionality allows loading forgotten laundry',
    ],
    consAr: [
      'إصلاح البوردة الإلكترونية خارج الضمان مرتفع التكلفة نسبياً',
      'توصيل الصرف الأرضي يحتاج فحص ارتفاع الحوض (60-90 سم)',
    ],
    consEn: [
      'Out-of-warranty inverter PCB repairs can be relatively expensive',
      'Drain hose height must follow 60–90 cm standpipe spec to prevent siphoning',
    ],
    buyerWarningsAr: [
      'ممنوع تماماً فتح الغسالة من الكرتونة قبل وصول فني إل جي (فك مسامير الحلة وإلا يسقط الضمان أو تتلف الحلة)',
      'تأكد من عمل خط أرضي ومقبس 16 أمبير مستقل أثناء التأسيس الكهربائي',
    ],
    buyerWarningsEn: [
      'Do NOT unbox or run without the LG agent removing shipping transit bolts first',
      'Install a dedicated 16A socket and proper earthing during kitchen plumbing/electrical rough-in',
    ],
    recommendedForAr: 'الأسر الباحثة عن هدوء تشغيل وكفاءة عالية للغسيل اليومي الثقيل والبطاطين الخفيفة',
    recommendedForEn: 'Couples prioritizing quiet apartment operation & large 9 KG daily load capacity',
  },
  'groom-p3': {
    slug: 'samsung-65-4k-crystal-uhd-tv',
    model: 'UA65CU8000',
    dimensions: '145 × 83 × 2.6 cm',
    capacity: '65 Inch 4K',
    energyRating: 'A+',
    warrantyMonths: 24,
    warrantyTermsAr: 'ضمان سنتين شامل من سامسونج مصر مع تغطية عيوب التصنيع (لا يشمل كسر الشاشة).',
    warrantyTermsEn: '2-year official Samsung Egypt warranty covering manufacturing defects (screen breakage excluded).',
    originCountryAr: 'مصنع سامسونج بني سويف (مصر)',
    originCountryEn: 'Samsung Beni Suef Factory (Egypt)',
    prosAr: [
      'نحافة AirSlim مناسبة جداً للتعليق على حائط الريسبشن دون بروز مزعج',
      'ريموت شمس ذكي لا يحتاج بطاريات خارجية',
      'معالجة حركة جيدة للمباريات والمحتوى الرياضي 4K',
    ],
    prosEn: [
      'Ultra-thin AirSlim profile sits flush against living room gypsum walls',
      'Eco SolarCell remote eliminates disposable battery swaps',
      'Clean 4K upscaling & motion handling for live sports',
    ],
    consAr: [
      'نسبة تباين الشاشة تقل قليلاً في الزوايا الجانبية الحادة مقارنة بلوحات IPS أو OLED',
      'صوت السماعات المدمجة 20 وات فقط وقد يحتاج ساوند بار في الريسبشن الواسع',
    ],
    consEn: [
      'VA panel viewing angles narrow noticeably from sharp side angles',
      '20W built-in speakers benefit from a dedicated soundbar in large receptions',
    ],
    buyerWarningsAr: [
      'تأكد من مسافة المشاهدة في الريسبشن: شاشة 65 بوصة تحتاج مسافة جلسة لا تقل عن 2.7 إلى 3.5 متر',
      'جهز كابلات HDMI في ماسورة دفن قبل تقفيل ديكور الجبسن بورد',
    ],
    buyerWarningsEn: [
      'Ensure sofa-to-wall viewing distance is at least 2.7–3.5 m for comfortable 65" viewing',
      'Run concealed HDMI conduit in gypsum wall before final paint coats',
    ],
    recommendedForAr: 'ريسبشن واسع من قطعتين أو ثلاث بمسافة جلوس تتجاوز 2.8 متر',
    recommendedForEn: 'Spacious reception rooms with 2.8m+ seating distance',
  },
  'groom-p4': {
    slug: 'fresh-platinum-5burner-cooker',
    model: '500001055-PLT',
    dimensions: '90 × 60 × 85 cm',
    capacity: '5 Burners / 110L Oven',
    energyRating: 'A',
    warrantyMonths: 60,
    warrantyTermsAr: 'ضمان 5 سنوات من شركة فريش إلكتريك مع توفر فوري لقطع الغيار الأصلية.',
    warrantyTermsEn: '5-year official Fresh Electric warranty with accessible nationwide spare parts.',
    originCountryAr: 'صنع في مصر',
    originCountryEn: 'Made in Egypt',
    prosAr: [
      'شعلات إيطالية مع نظام أمان كامل يفصل الغاز تلقائياً عند انطفاء الشعلة',
      'سعة فرن كبيرة تكفي صواني العزومات مع مروحة توزيع حرارة',
      'مؤشر رقمي للتحكم في وقت الطهي',
    ],
    prosEn: [
      'Full thermocouple flame-failure safety cuts gas automatically',
      'Extra-wide 110L oven cavity with dual convection fans for even baking',
      'Cast iron pan grates withstand heavy cookware',
    ],
    consAr: [
      'مقاس 90 سم يشغل مساحة أوسع في المطابخ الضيقة (بديل 60×60 متاح لمن مساحته محدودة)',
      'يحتاج خبير غاز طبيعي لتغيير الفونيات إذا تم الانتقال من أسطوانة لغاز طبيعي',
    ],
    consEn: [
      '90 cm width consumes tight counter runs in compact kitchens',
      'Requires natural gas nozzle conversion kit when switching from LPG cylinder',
    ],
    buyerWarningsAr: [
      'لا تقم بتركيب البوتاجاز قبل معاينة فني الغاز الطبيعي أو شركة الغاز لتفادي مشاكل وصلة النحاس والتهوية',
      'احرص على وجود مسافة 5 سم على جانبي البوتاجاز بعيداً عن ثلاجة أو خزائن ألوميتال مباشرة',
    ],
    buyerWarningsEn: [
      'Coordinate natural gas line valve alignment before cabinetry installation',
      'Avoid placing directly flush next to the refrigerator without heat insulation gap',
    ],
    recommendedForAr: 'المطابخ التي تتسع لعرض 90 سم ومحبي العزومات الأسرية',
    recommendedForEn: 'Full-size kitchens accommodating a 90 cm cooker footprint',
  },
  'groom-p5': {
    slug: 'gawaz-royal-master-bedroom-set',
    model: 'GIN-BED-2026-R',
    dimensions: 'Bed 180×200 cm | Wardrobe 260×220×60 cm',
    capacity: 'King Complete 5 Pcs',
    energyRating: 'N/A',
    warrantyMonths: 120,
    warrantyTermsAr: 'ضمان 10 سنوات على هيكل الخشب الزان وإكسسوارات الأدراج والمجر السوفت كلوز عبر جواز إن.',
    warrantyTermsEn: '10-year structural warranty on beech timber joints and soft-close hardware.',
    originCountryAr: 'تصنيع دمياط — مصر (فرز تصدير)',
    originCountryEn: 'Handcrafted in Damietta, Egypt (Export Grade)',
    prosAr: [
      'خشب زان روماني مجفف مقاوم للتقوس وتمدد الرطوبة',
      'مجر تلسكوبية وإكسسوار سوفت كلوز لهدوء الاستخدام اليومي',
      'دولاب بعمق كامل وتوزيع أرفف وعلّاقات مدروس لشقة الزوجين',
    ],
    prosEn: [
      'Kiln-dried Romanian beech framing resists warping across seasons',
      'Soft-close telescopic drawer channels & quiet sliding tracks',
      'Deep 260 cm closet engineered for shared couples wardrobe storage',
    ],
    consAr: [
      'وزن الدولاب الثقيل يصعّب نقله المتكرر لاحقاً ويتطلب فكاً احترافياً',
      'مقاس الدولاب 260 سم غير مناسب لغرف النوم التي تقل واجهتها الصافية عن 290 سم',
    ],
    consEn: [
      'Heavy solid timber construction requires pro dismantling for future moves',
      '260 cm wardrobe width requires >= 290 cm unobstructed bedroom wall length',
    ],
    buyerWarningsAr: [
      'قِس طول الحائط الفعلي بعد تركيب الكرانيش والجبسن بورد والباركيه قبل اعتماد الدولاب 260 سم',
      'افحص المراتب (سوست متصلة أم منفصلة ارتفاع 28 سم) لتتوافق مع ارتفاع السرير',
    ],
    buyerWarningsEn: [
      'Measure finished bedroom wall net of skirting boards & sockets before ordering 260 cm width',
      'Match mattress height (26–30 cm pocket spring) to headboard clearance',
    ],
    recommendedForAr: 'غرف النوم الماستر بمساحة 3.6×4 متر فأكثر',
    recommendedForEn: 'Master bedrooms measuring 3.6×4.0m or larger',
  },
  'groom-p6': {
    slug: 'gawaz-modern-l-shape-sectional-sofa',
    model: 'GIN-SOF-L300',
    dimensions: '300 × 200 × 85 cm',
    capacity: '6–7 Persons + Ottoman',
    energyRating: 'N/A',
    warrantyMonths: 60,
    warrantyTermsAr: 'ضمان 5 سنوات على هيكل الخشب الزان وكثافة الإسفنج ضد الهبوط الملحوظ.',
    warrantyTermsEn: '5-year warranty on kiln-dried beech frame and high-density foam resilience.',
    originCountryAr: 'صنع في مصر — دمياط والقاهرة الجديدة',
    originCountryEn: 'Made in Egypt (Damietta & New Cairo)',
    prosAr: [
      'كثافة 33 سوفت تعطي توازناً مريحاً دون غوص سريع للجلسة',
      'أقمشة قطيفة أو كتان معالجة لسهولة مسح البقع اليومية',
      'تصميم حرف L يستغل ركنة الليفينج بأعلى عدد مقاعد',
    ],
    prosEn: [
      '33-density foam offers supportive bounce without rapid sagging',
      'Stain-resistant upholstery simplifies everyday coffee/spill wipe-downs',
      'L-shape maximizes seating in open-plan reception living corners',
    ],
    consAr: [
      'اتجاه الشيزلونج (يمين أو شمال) يجب تحديده مسبقاً حسب مخطط الشقة',
      'ليست مزودة بسرير سحاب مدمج ما لم يتم طلبه بمواصفات مخصصة',
    ],
    consEn: [
      'Chaise orientation (Left/Right) is fixed upon order — verify apartment layout first',
      'Standard edition does not include pull-out sofa bed mechanism',
    ],
    buyerWarningsAr: [
      'تأكد من إمكانية دوران أجزاء الركنة داخل السلم أو المصعد قبل التصنيع',
      'حدد اتجاه الـ L (يمين أم يسار وأنت تقف أمامها) بناءً على مكان التلفاز والشباك',
    ],
    buyerWarningsEn: [
      'Verify stairwell/elevator turning radius for 200 cm sofa sections',
      'Confirm Right vs Left chaise configuration against TV wall location',
    ],
    recommendedForAr: 'غرفة الليفينج اليومية أو الاستقبال المودرن المفتوح',
    recommendedForEn: 'Everyday family living rooms & open-plan modern apartments',
  },
  'bride-p1': {
    slug: 'korkmaz-11pc-titanium-granite-cookware',
    model: 'KRK-A1811-TIT',
    dimensions: 'Pots: 18 / 22 / 24 / 26 / 28 cm',
    capacity: '11 Pieces Complete Set',
    energyRating: 'N/A',
    warrantyMonths: 24,
    warrantyTermsAr: 'ضمان سنتين من الوكيل المعتمد ضد تقشير الطلاء الداخلي عند اتباع تعليمات الاستخدام بدون أدوات حادة.',
    warrantyTermsEn: '2-year distributor warranty against interior coating peeling under normal wooden/silicone utensil use.',
    originCountryAr: 'صنع في تركيا',
    originCountryEn: 'Made in Turkey',
    prosAr: [
      'ألمنيوم مصبوب بسمك ممتاز يحفظ توزيع الحرارة بدون شياط للأكل',
      'خالية 100% من مادة PFOA والرصاص والكادميوم',
      'أغطية بايركس بحواف ستانلس ستيل تمنع التلف عند الصدمات الخفيفة',
    ],
    prosEn: [
      'Thick cast-aluminum body distributes heat evenly and prevents hotspots',
      'Certified 100% PFOA, lead, and cadmium free',
      'Tempered Pyrex lids with stainless steel rims protect against chips',
    ],
    consAr: [
      'الوزن ثقيل نسبياً عند ملئه، والأيادي المعدنية تسخن إذا تعرضت لفرن مباشر مرتفع الحرارة',
      'تحتاج صيانة بحذر وعدم استخدام سلك مواعين خشن',
    ],
    consEn: [
      'Substantial weight when full; avoid metal scouring pads',
      'Dishwasher strong detergents may dull outer matte finish over time',
    ],
    buyerWarningsAr: [
      'اشترِ سيريال مختوم بباركود الوكيل واختبر مطابقة الباركود مع موقع كوركماز لتجنب التقليد المنتشر في السوق',
      'استخدمي ملاعق سيليكون أو خشب طبيعي فقط للحفاظ على طبقة الجرانيت',
    ],
    buyerWarningsEn: [
      'Verify official agent hologram & barcode due to counterfeit imitations in local souqs',
      'Use only silicone or wooden spatulas to preserve titanium non-stick coating',
    ],
    recommendedForAr: 'المطبخ الأساسي اليومي للعروسة بدلاً من شراء 3 أطقم رديئة',
    recommendedForEn: 'Core daily bridal cooking set replacing multiple low-grade sets',
  },
  'bride-p2': {
    slug: 'fathi-mahmoud-124pc-bone-china-set',
    model: 'FM-ROY-124G',
    dimensions: 'Box: 64 × 48 × 46 cm (18 KG)',
    capacity: '124 Pieces (12 Guests)',
    energyRating: 'N/A',
    warrantyMonths: 12,
    warrantyTermsAr: 'فحص ومعاينة الكسر أو الشروخ عند الاستلام قبل التوقيع + تغليف مصنع فتحي محمود الأصلي.',
    warrantyTermsEn: 'Open-crate breakage inspection at delivery against Fathi Mahmoud factory seal.',
    originCountryAr: 'بورسلين مصري معالج بالذهب الألماني',
    originCountryEn: 'Egyptian Bone China with German Gold Trim',
    prosAr: [
      'خفة وزن البورسلين العظمي مع صلابة عالية وشفافية راقية تحت الإضاءة',
      'إمكانية تعويض القطع الفردية المكسورة مستقبلاً من معارض المصنع في مصر',
      'يشمل طقم السفره والشاي والجاتوه والسلاطين بالكامل دون نقص',
    ],
    prosEn: [
      'Lightweight translucent porcelain body with refined elegance',
      'Open-stock individual piece replacement possible via local Fathi Mahmoud showrooms',
      'Complete banquet dinner + tea + dessert service for 12 guests',
    ],
    consAr: [
      'الأطراف المذهبة عيار 24 غير قابلة للاستخدام في الميكروويف نهائياً',
      'يتطلب رف نيش متين أو تقسيم في أدراج بوفية السفرة لتفادي احتكاك الأطباق',
    ],
    consEn: [
      '24K gold rim trim MUST NEVER be placed inside a microwave oven',
      'Heavy 124-piece set requires reinforced display cabinet or padded drawer storage',
    ],
    buyerWarningsAr: [
      'ممنوع تماماً وضع الصيني المذهب داخل الميكروويف أو برامج الغسالة شديدة الحرارة',
      'اختاري طقماً عملياً إضافياً سادة (أركوبال أو أوبال) للاستخدام اليومي حتى يظل الصيني سليماً',
    ],
    buyerWarningsEn: [
      'Never microwave gold-trimmed plates (causes arcing and ruins gold luster)',
      'Pair with a durable plain opalware everyday set so formal china stays pristine',
    ],
    recommendedForAr: 'العزومات الرسمية وسفرة الضيوف في جهاز العروسة',
    recommendedForEn: 'Formal hosting and festive dinner occasions',
  },
  'bride-p3': {
    slug: 'tac-bridal-caviar-satin-bedspread',
    model: 'TAC-SATIN-C6',
    dimensions: 'Bedspread 260 × 260 cm',
    capacity: 'King 6 Pieces',
    energyRating: 'N/A',
    warrantyMonths: 12,
    warrantyTermsAr: 'ضمان مطابقة الأنسجة وخلوه من عيوب التطريز عند الاستلام بالكود الأصلي لشركة Zorlu / Taç.',
    warrantyTermsEn: 'Guaranteed authentic Zorlu / Taç factory stitch & fabric integrity upon unboxing.',
    originCountryAr: 'صنع في تركيا (مجموعة زورلو)',
    originCountryEn: 'Made in Turkey (Zorlu Group)',
    prosAr: [
      'لمسة ناعمة غير مزعجة للجلد ومظهر فندقي فاخر لغرفة النوم',
      'دانتيل فرنسي مثبت بخياطة دقيقة لا ينفصل مع التنظيف الجاف الصحيح',
      'مقاس وافي يغطي مراتب الارتفاع العالي حتى 32 سم بالكامل',
    ],
    prosEn: [
      'Silky smooth finish with understated royal ivory bridal appeal',
      'Reinforced French lace stitching holds shape under dry cleaning',
      'Generous 260×260 cm cut drapes neatly over thick 30 cm mattresses',
    ],
    consAr: [
      'يُفضل عدم غسله داخل الغسالة المنزلية لتفادي تشابك اللؤلؤ والدانتيل',
      'غير مخصص للنوم اليومي الصيفي المتكرر — يُنصح بتبديله بملايات قطنية نهارية',
    ],
    consEn: [
      'Requires gentle/dry clean care due to pearl & lace embellishments',
      'Intended as display/special occasion spread; switch to 100% cotton sheets for daily sleep',
    ],
    buyerWarningsAr: [
      'احتفظي بأكياس التغليف القماشية لتخزين المفرش داخل سحارة السرير بعيداً عن الرطوبة',
      'استغني عن شراء 4-5 مفارش زينة باهظة والاكتفاء بمفرش واحد أو اثنين عمليين',
    ],
    buyerWarningsEn: [
      'Store in breathable cotton garment bags to preserve off-white satin luster',
      'Avoid overspending on 4+ formal spreads; 1–2 high-grade sets suffice',
    ],
    recommendedForAr: 'غرفة النوم الرئيسية ومفرش ليلة العمر',
    recommendedForEn: 'Primary bridal suite centerpiece bedspread',
  },
  'bride-p4': {
    slug: 'kenwood-titanium-chef-patissier-1400w',
    model: 'KWL90.004SI',
    dimensions: '39 × 20 × 38.5 cm (12.5 KG)',
    capacity: '7L + 5L Dual Bowls / 1400W',
    energyRating: 'A',
    warrantyMonths: 24,
    warrantyTermsAr: 'ضمان سنتين من الوكيل المعتمد في مصر على المحرك والترس الكوكبي.',
    warrantyTermsEn: '2-year local distributor warranty covering motor and planetary gearbox.',
    originCountryAr: 'تصميم بريطاني (صنع في الصين بمعايير كينوود)',
    originCountryEn: 'Designed in UK (Kenwood Global Assembly)',
    prosAr: [
      'نظام تدفئة مدمج بالوعاء لتخمير العجين وإذابة الشوكولاتة مباشرة',
      'ميزان رقمي مدمج بالوعاء يغني عن الميزان المنفصل وتقليل المواعين',
      'حلة مزدوجة 7 لتر و5 لتر مدمجتان معاً لتوفير مساحة التخزين',
    ],
    prosEn: [
      'Integrated induction warming element proofs yeast dough and melts chocolate in-bowl',
      'Built-in digital weighing scale saves steps & extra bowl washing',
      'Nesting 7L and 5L stainless bowls cover both mega and daily baking batches',
    ],
    consAr: [
      'سعر مرتفع جداً مقارنة بالعجانات الاقتصادية، ووزنه 12.5 كجم يجعله صعب النقل من الدولاب يومياً',
      'يحتاج تخصيص ركن دائم على الرخامة أو وحدة رفع داخل المطبخ',
    ],
    consEn: [
      'Premium price tier; 12.5 kg weight is heavy to lift in/out of deep cabinets daily',
      'Best positioned on a permanent countertop corner',
    ],
    buyerWarningsAr: [
      'إذا كان استخدامك للخبز والعجن خفيفاً، فراجعي بديل 800–1000 وات لتوفير أكثر من نصف الميزانية لأساسيات أهم',
      'تأكدي من وجود فيشة قوية تتحمل سحب 1400 وات بعيداً عن مشترك رديء',
    ],
    buyerWarningsEn: [
      'If baking only occasionally, a compact stand mixer saves over 50% of budget',
      'Plug directly into a wall socket rather than lightweight power strips',
    ],
    recommendedForAr: 'محبات المخبوزات والمعجنات والحلويات المنزلية المتكررة',
    recommendedForEn: 'Home bakers and passionate culinary enthusiasts',
  },
  'bride-p5': {
    slug: 'maison-dartisan-14pc-cotton-bathrobe-set',
    model: 'MSN-EGY-14PR',
    dimensions: 'Bath Sheets 100 × 150 cm',
    capacity: '14 Pieces (650 GSM)',
    energyRating: 'N/A',
    warrantyMonths: 12,
    warrantyTermsAr: 'ضمان استبدال حال وجود بهتان ألوان أو تنسيل قبل الغسيل الأول من المصنع.',
    warrantyTermsEn: 'Factory defect replacement before initial wash if dye bleed or weave pulls occur.',
    originCountryAr: 'قطن مصري 100% — المحلة الكبرى / إمبابة تصدير',
    originCountryEn: '100% Egyptian Long-Staple Cotton — El Mahalla Export Grade',
    prosAr: [
      'كثافة 650 جرام/م² توفر امتصاصاً سريعاً جداً ومتانة طويلة بعد عشرات الغسلات',
      'برنس حريمي ورجالي مقاسات مضبوطة + خفان متطابقان',
      'قيمة ممتازة مقارنة بالمستورد بنفس الوزن الفعلي للقطن',
    ],
    prosEn: [
      'Plush 650 GSM loop weave absorbs moisture rapidly and holds softness',
      'Matched his & hers robes + oversized 100×150 cm bath sheets',
      'Superior cotton weight per pound compared to overpriced synthetic blends',
    ],
    consAr: [
      'المناشف الثقيلة 650 GSM تحتاج فترة تجفيف أطول قليلاً في الشتاء',
      'تحتاج غسلة أولى منفصلة بالماء البارد بدون منعم أقمشة لفتح ألياف الامتصاص',
    ],
    consEn: [
      'Heavyweight 650 GSM cotton requires extra line-drying time in damp winters',
      'Wash once before use without fabric softener (softener coats cotton and reduces absorbency)',
    ],
    buyerWarningsAr: [
      'ممنوع إضافة منعم أقمشة في غسيل الفوط والبرانس لأنه يكوّن طبقة شمعية تمنع امتصاص المياه',
      'تأكدي من وجود بطاقة 100% Egyptian Cotton على الليبل وليس بوليستر مخلوط',
    ],
    buyerWarningsEn: [
      'Skip fabric softeners when laundering cotton towels — it coats fibers and cuts absorbency',
      'Check woven label for 100% Cotton without polyester micro-blends',
    ],
    recommendedForAr: 'كل جهاز عروسة عملي بجودة تصدير مصرية أصلية',
    recommendedForEn: 'Essential heirloom-grade Egyptian cotton set for every bridal trousseau',
  },
};

export const STAGE6_ADDITIONAL_PRODUCTS: Product[] = [
  {
    id: 'groom-p7',
    slug: 'tornado-350l-nofrost-fridge',
    trousseauType: 'groom',
    category: 'appliances',
    categoryAr: 'الأجهزة الكهربائية الكبيرة',
    categoryEn: 'Major Home Appliances',
    nameAr: 'ثلاجة تورنيدو ديجيتال نوفروست 350 لتر — سيلفر ميتاليك موفرة للطاقة',
    nameEn: 'Tornado No-Frost Digital Refrigerator 350L — Compact Energy Saver Silver',
    brand: 'TORNADO (العربي)',
    model: 'RF-450T-SL',
    price: 23900,
    originalPrice: 26500,
    sku: 'TRN-REF-350-SL',
    stock: 19,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'الخيار الاقتصادي والعملي الأمثل للمطابخ الصغيرة والمتوسطة بضمان مجموعة العربي وقطع غيار متوفرة بكل محافظات مصر.',
    descriptionEn: 'Smart compact budget refrigerator tailored for tight Egyptian apartments backed by El-Araby 10-year service network.',
    specsAr: { 'السعة': '350 لتر', 'الأبعاد': '169 × 64 × 66 سم', 'تصنيف الطاقة': 'A+', 'الضمان': '10 سنوات العربي' },
    specsEn: { 'Capacity': '350 Liters', 'Dimensions': '169 × 64 × 66 cm', 'Energy Class': 'A+', 'Warranty': '10 Years Official' },
    dimensions: '169 × 64 × 66 cm',
    capacity: '350 L',
    energyRating: 'A+',
    warrantyMonths: 120,
    warrantyTermsAr: 'ضمان 10 سنوات شامل من مجموعة العربي مع فحص مجاني في السنة الأولى.',
    warrantyTermsEn: '10-year official El-Araby warranty covering parts and nationwide home technician visits.',
    originCountryAr: 'تجميع مصري (مصنع العربي قويسنا)',
    originCountryEn: 'Made in Egypt (El-Araby Quesna)',
    prosAr: [
      'أوفر بـ 12,600 ج.م مقارنة بالثلاجة الـ 450 لتر مع الحفاظ على نفس شبكة خدمة العربي',
      'عرض 64 سم يمر بسهولة من كافة أبواب المطابخ والكمبوندات الضيقة',
      'استهلاك كهرباء منخفض مناسب للشريحة المنزلية المتوسطة',
    ],
    prosEn: [
      'Saves 12,600 EGP over 450L flagship while sharing the exact El-Araby warranty network',
      '64 cm narrow width glides easily through tight kitchen doors & elevators',
      'Low annual kWh power draw fits economical monthly household bills',
    ],
    consAr: [
      'مساحة الفريزر متوسطة وتكفي الاستخدام اليومي دون تخزين كميات موسمية ضخمة',
      'لا تشمل وحدة أيون البلازما كلاستر المتقدمة الموجودة في شارب',
    ],
    consEn: [
      'Moderate freezer drawer volume suited for 2–3 persons rather than bulk yearly stocking',
      'Lacks Plasmacluster active air ionization found in Sharp models',
    ],
    buyerWarningsAr: [
      'مناسبة جداً إذا كانت مساحة مكان الثلاجة بين 68 و 72 سم فقط بدلاً من تضييق المطبخ بالثلاجات العريضة',
      'احفظ كارت الضمان والفاتورة الإلكترونية داخل ملف الضمانات في جواز إن فور الاستلام',
    ],
    buyerWarningsEn: [
      'Ideal when built-in cabinetry niche width is capped at 68–72 cm',
      'Store tax invoice inside your My Gawaz Inn Warranties vault immediately on delivery',
    ],
    recommendedForAr: 'الشقق من 70 إلى 110 م² والميزانيات الاقتصادية الذكية',
    recommendedForEn: 'Apartments 70–110m² and value-focused starter couples',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: false,
  },
  {
    id: 'groom-p8',
    slug: 'samsung-580l-twin-cooling-fridge',
    trousseauType: 'groom',
    category: 'appliances',
    categoryAr: 'الأجهزة الكهربائية الكبيرة',
    categoryEn: 'Major Home Appliances',
    nameAr: 'ثلاجة سامسونج Twin Cooling Plus ديجيتال إنفرتر 580 لتر — ستانلس جرافيت',
    nameEn: 'Samsung 580L Twin Cooling Plus Digital Inverter Fridge — Brushed Graphite',
    brand: 'SAMSUNG',
    model: 'RT58K7050SL',
    price: 54900,
    originalPrice: 59500,
    sku: 'SAM-REF-580-GR',
    stock: 7,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80',
    descriptionAr: 'تكنولوجيا التبريد المزدوج المنفصل للثلاجة والفريزر (5 أوضاع تحويل ذكية) مع رطوبة تصل لـ 70% لحفظ الطعام.',
    descriptionEn: 'Dual evaporator Twin Cooling Plus prevents odor transfer between freezer and fridge with 5 Smart Conversion modes.',
    specsAr: { 'السعة': '580 لتر', 'الأبعاد': '178 × 83.6 × 74.2 سم', 'تصنيف الطاقة': 'A++', 'الضمان': '10 سنوات كمبريسور' },
    specsEn: { 'Capacity': '580 Liters', 'Dimensions': '178 × 83.6 × 74.2 cm', 'Energy Class': 'A++', 'Warranty': '10 Years Compressor' },
    dimensions: '178 × 83.6 × 74.2 cm',
    capacity: '580 L',
    energyRating: 'A++',
    warrantyMonths: 120,
    warrantyTermsAr: 'ضمان 10 سنوات على كمبريسور الإنفرتر الرقمي + 3 سنوات شامل من سامسونج مصر.',
    warrantyTermsEn: '10-year digital inverter compressor warranty + 3-year full parts warranty.',
    originCountryAr: 'صنع في تايلاند / تجميع إقليمي معتمد',
    originCountryEn: 'Made in Thailand (Official Agent Import)',
    prosAr: [
      'تبريد منفصل تماماً يمنع انتقال رائحة الثوم والأسماك من الثلاجة للفريزر والعكس',
      'سعة عائلية عملاقة 580 لتر بتصميم عملي من الباب المزدوج',
      'كفاءة طاقة ممتازة A++ تخفض الاستهلاك عند التحويل لوضع العطلات',
    ],
    prosEn: [
      'Independent dual evaporators completely block odor mixing between compartments',
      'Massive 580L family volume without needing side-by-side double width',
      'A++ energy efficiency plus Smart Conversion Holiday Mode',
    ],
    consAr: [
      'عرض 83.6 سم كبير جداً ولا يناسب المطابخ التقليدية دون تصميم مسبق',
      'ارتفاع السعر بحوالي 50% عن فئة 450 لتر',
    ],
    consEn: [
      '83.6 cm ultra-wide body demands dedicated kitchen niche design during finishing',
      'Higher purchase price (~50% premium over 450L models)',
    ],
    buyerWarningsAr: [
      'تحقق أولاً من عرض الممر والباب والمنور قبل شراء ثلاجة بعرض 84 سم وعمق 74 سم',
      'تأكد من فاتورة ضريبية مختومة بالوكيل الرسمي لأن المستورد الموازي يباع بدون ضمان 10 سنوات في مصر',
    ],
    buyerWarningsEn: [
      'Measure EVERY doorway, hallway turn, and elevator depth for 83.6 cm width BEFORE checkout',
      'Insist on official agent tax invoice — parallel imports lack 10-year compressor support',
    ],
    recommendedForAr: 'الشقق الواسعة والفلل ومطابخ الأمريكان كيتشن من 160 م² فأكثر',
    recommendedForEn: 'Large open-plan kitchens, duplexes & villas 160m²+',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: true,
  },
  {
    id: 'groom-p9',
    slug: 'beko-8kg-steamcure-washer',
    trousseauType: 'groom',
    category: 'appliances',
    categoryAr: 'الأجهزة الكهربائية الكبيرة',
    categoryEn: 'Major Home Appliances',
    nameAr: 'غسالة بيكو أوتوماتيك 8 كيلو إنفرتر بتقنية SteamCure وبرامج سريعة 14 دقيقة',
    nameEn: 'Beko Front Load Washer 8KG ProSmart Inverter SteamCure',
    brand: 'BEKO',
    model: 'WTV8612XS0',
    price: 21400,
    originalPrice: 23800,
    sku: 'BEK-WSH-8KG-WT',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'توازن مثالي للسعر مقابل الأداء بموتور ProSmart Inverter هادئ وبرامج بخار لإزالة التجاعيد والبقع الصعبة.',
    descriptionEn: 'Top value-for-money 8KG washer combining ProSmart Inverter motor, StainExpert 24-stain cycle & 14-min Xpress wash.',
    specsAr: { 'السعة': '8 كجم', 'سرعة العصر': '1200 لفة/دقيقة', 'تصنيف الطاقة': 'A+++', 'الضمان': '5 سنوات بيكو مصر' },
    specsEn: { 'Load': '8 KG', 'Spin': '1200 RPM', 'Energy Class': 'A+++', 'Warranty': '5 Years Beko Egypt' },
    dimensions: '84 × 60 × 55 cm',
    capacity: '8 KG',
    energyRating: 'A+++',
    warrantyMonths: 60,
    warrantyTermsAr: 'ضمان 5 سنوات شامل من بيكو مصر + 10 سنوات على موتور الإنفرتر المسجل.',
    warrantyTermsEn: '5-year comprehensive Beko Egypt warranty + 10-year registered ProSmart motor warranty.',
    originCountryAr: 'تركيا / مصنع بيكو العاشر من رمضان',
    originCountryEn: 'Turkey / Egypt Beko Plant',
    prosAr: [
      'أوفر بـ 8,400 ج.م عن فئة 9 كيلو مع أداء ممتاز بالبخار للقمصان والملابس اليومية',
      'كفاءة طاقة A+++ فائقة التوفير للماء والكهرباء',
      'حلة ستانلس بتقنية AquaWave لحماية الأنسجة الحساسة',
    ],
    prosEn: [
      'Saves 8,400 EGP vs flagship 9KG units without losing inverter efficiency',
      'Top A+++ efficiency minimizes water & electricity footprint',
      'AquaWave drum pattern protects delicate bridal linens',
    ],
    consAr: [
      'سرعة عصر 1200 لفة أقل قليلاً من 1400 لفة عند غسيل الألحفة الشتوية الثقيلة',
      'لا تدعم ربط الواي فاي الكامل مثل موديلات LG العليا',
    ],
    consEn: [
      '1200 RPM spin retains slightly more moisture in winter quilts vs 1400 RPM',
      'Bluetooth HomeWhiz only — lacks remote cloud Wi-Fi start',
    ],
    buyerWarningsAr: [
      'اختر موديل 8 كجم للشقق الصغيرة وتأكد من ترك عمق 60 سم لخرطوم التغذية والصرف خلف الغسالة',
      'لا تعتمد على توصيل كهربائي مشترك مع سخان مياه كهربائي على نفس الخط',
    ],
    buyerWarningsEn: [
      'Reserve 60 cm total depth behind appliance for water inlet & drain bend clearances',
      'Never share breaker circuit simultaneously with an electric water heater',
    ],
    recommendedForAr: 'الشقق الصغيرة والمتوسطة وتجهيز العريس الاقتصادي الذكي',
    recommendedForEn: 'Small-to-medium apartments seeking best cost-per-year washing performance',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: false,
  },
  {
    id: 'groom-p10',
    slug: 'carrier-optimax-225hp-inverter-ac',
    trousseauType: 'groom',
    category: 'ac_climate',
    categoryAr: 'التكييفات والمناخ المنزلي',
    categoryEn: 'Air Conditioning & Climate',
    nameAr: 'تكييف كاريير أوبتيماكس برو 2.25 حصان إنفرتر بارد/ساخن — بلازما وشاشة ديجيتال',
    nameEn: 'Carrier Optimax Pro 2.25 HP Inverter Heat & Cool Split AC',
    brand: 'CARRIER (ميراكو)',
    model: '53QHCT18-INV',
    price: 38500,
    originalPrice: 41900,
    sku: 'CRR-AC-225-INV',
    stock: 11,
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'تكييف كاريير الأقوى تحملاً لموجات الحر الشديدة حتى 50° مئوية مع نظام إنفرتر يوفر حتى 40% من الكهرباء.',
    descriptionEn: 'Tropical-rated compressor withstanding 50°C Egyptian summers while Inverter drives cut monthly electricity up to 40%.',
    specsAr: { 'القدرة': '2.25 حصان (18000 BTU)', 'التغطية': '18 إلى 24 م²', 'تصنيف الطاقة': 'A++ إنفرتر', 'الضمان': '5 سنوات ميراكو كاريير' },
    specsEn: { 'Cooling': '2.25 HP (18,000 BTU)', 'Coverage': '18 – 24 m²', 'Energy Class': 'A++ Inverter', 'Warranty': '5 Years Miraco Carrier' },
    dimensions: 'Indoor 97 × 30 × 22 cm | Outdoor 80 × 55 × 33 cm',
    capacity: '18,000 BTU (18–24 m²)',
    energyRating: 'A++',
    warrantyMonths: 60,
    warrantyTermsAr: 'ضمان 5 سنوات من شركة ميراكو كاريير مصر (يشمل 3 أمتار مواسير نحاس أصلية في الباكدج الرسمي).',
    warrantyTermsEn: '5-year Miraco Carrier official warranty (includes 3m factory copper pipe bundle; extra length billed per meter).',
    originCountryAr: 'مصنع ميراكو كاريير مصر',
    originCountryEn: 'Made in Egypt (Miraco Carrier)',
    prosAr: [
      'أداء ممتاز في الأدوار الأخيرة أو الواجهات البحرية والقبلية المعرضة للشمس',
      'يوفر استهلاكاً ملموساً في الكهرباء مقارنة بالتكييف العادي غير الإنفرتر عند التشغيل المتواصل',
      'صيانة موثوقة وتوافر فريون R410A وقطع الغيار بجميع المراكز',
    ],
    prosEn: [
      'Handles sun-exposed top floors & west-facing facades reliably during heatwaves',
      'Saves substantial electricity vs fixed-speed ACs during overnight operation',
      'Service centers & certified technicians available nationwide',
    ],
    consAr: [
      'تكلفة الشراء والتركيب أعلى بـ 30% من الموديلات الاقتصادية غير الإنفرتر',
      'حساس لتغذية الكهرباء غير المستقرة إذا لم يُركب مع مفتاح بتشينو/شنيدر مخصص وقاطع تسرب',
    ],
    consEn: [
      '30% higher upfront unit price than non-inverter units',
      'Requires clean 20A/25A dedicated breaker during electrical finishing',
    ],
    buyerWarningsAr: [
      'احسب المساحة بدقة أولاً بحاسبة التكييف BTU قبل الشراء حتى لا تجهد الكمبريسور في صالة أكبر من 24 متر',
      'عند تأسيس دفن مواسير التكييف أثناء التشطيب: تأكد من كبس النحاس بالنيتروجين لمنع تسريب الفريون لاحقاً',
    ],
    buyerWarningsEn: [
      'Verify exact room BTU needs first (add 0.5 HP if top floor or sunny west exposure)',
      'Pressure-test concealed copper piping with Nitrogen during rough-in before plastering!',
    ],
    recommendedForAr: 'الصالات متوسطة المساحة أو غرف النوم الكبيرة 18 إلى 24 متر مربع',
    recommendedForEn: 'Mid-sized living spaces & spacious master bedrooms (18–24 m²)',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: true,
  },
  {
    id: 'groom-p11',
    slug: 'fresh-new-smart-15hp-inverter-ac',
    trousseauType: 'groom',
    category: 'ac_climate',
    categoryAr: 'التكييفات والمناخ المنزلي',
    categoryEn: 'Air Conditioning & Climate',
    nameAr: 'تكييف فريش سمارت 1.5 حصان إنفرتر بارد فقط — أبيض شاشة مخفية',
    nameEn: 'Fresh New Smart 1.5 HP Inverter Split AC (Cool Only — Economy Room)',
    brand: 'FRESH',
    model: 'FUFW12C-IW',
    price: 22900,
    originalPrice: 24800,
    sku: 'FRS-AC-150-INV',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'تكييف غرف النوم الاقتصادي بقدرة 1.5 حصان وتكنولوجيا إنفرتر موفرة للكهرباء وصوت هادئ.',
    descriptionEn: 'Cost-effective 1.5 HP bedroom Inverter AC delivering quiet sleep cooling up to 14 m².',
    specsAr: { 'القدرة': '1.5 حصان (12000 BTU)', 'التغطية': '10 إلى 14 م²', 'تصنيف الطاقة': 'A+ إنفرتر', 'الضمان': '5 سنوات فريش' },
    specsEn: { 'Cooling': '1.5 HP (12,000 BTU)', 'Coverage': '10 – 14 m²', 'Energy Class': 'A+ Inverter', 'Warranty': '5 Years Fresh' },
    dimensions: 'Indoor 81 × 28 × 20 cm | Outdoor 72 × 49 × 27 cm',
    capacity: '12,000 BTU (10–14 m²)',
    energyRating: 'A+',
    warrantyMonths: 60,
    warrantyTermsAr: 'ضمان 5 سنوات شامل من فريش مصر بشرط التركيب عبر مركز الخدمة المعتمد 19059.',
    warrantyTermsEn: '5-year Fresh Electric warranty subject to installation by authorized 19059 service team.',
    originCountryAr: 'صنع في مصر',
    originCountryEn: 'Made in Egypt',
    prosAr: [
      'أوفر حل لتكييف غرف النوم من 10 إلى 14 متر بتقنية إنفرتر حقيقية',
      'تركيب وصيانة سريعة بتكلفة أقل من الماركات المستوردة',
    ],
    prosEn: [
      'Most budget-friendly true-inverter AC for bedrooms 10–14 m²',
      'Rapid local installation and affordable out-of-warranty spares',
    ],
    consAr: [
      'بارد فقط ولا يغني عن الدفاية في الشتاء البارد',
      'قدرته لا تكفي نهائياً لغرف تتجاوز 15 م² أو الدور الأخير بدون عزل',
    ],
    consEn: [
      'Cool-only model — lacks heat pump winter heating',
      'Undersized for rooms > 15 m² or uninsulated top-floor heat',
    ],
    buyerWarningsAr: [
      'لا تركب 1.5 حصان في الريسبشن أبداً؛ احتفظ به لغرفة النوم المغلقة لتوفير الكهرباء وحماية الجهاز',
      'لا توقع على إيصال استلام قبل التأكد من ختم الضمان وتاريخ الشراء',
    ],
    buyerWarningsEn: [
      'Reserve 1.5 HP strictly for enclosed bedrooms <= 14 m² to avoid continuous compressor strain',
      'Inspect official Fresh warranty card stamp before technician leaves',
    ],
    recommendedForAr: 'غرف النوم القياسية وغرفة الأطفال (10–14 م²)',
    recommendedForEn: 'Standard bedrooms & nursery rooms (10–14 m²)',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: false,
  },
  {
    id: 'shared-p1',
    slug: 'grohe-precision-thermostatic-mixer-kit',
    trousseauType: 'finishing',
    category: 'sanitary_finishing',
    categoryAr: 'تشطيب السباكة والأطقم الصحية',
    categoryEn: 'Sanitary & Plumbing Finishing',
    nameAr: 'طقم خلاط دش دفن ثرموستاتيك جروهي ألماني مع راس مطرية — كروم لامع',
    nameEn: 'Grohe Precision Concealed Thermostatic Shower Set with Rain Head — Chrome',
    brand: 'GROHE (ألمانيا)',
    model: '34705000-EG',
    price: 19600,
    originalPrice: 22400,
    sku: 'GRH-THM-2026',
    stock: 9,
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'مجموعة دش دفن أصلية ألمانية بحماية SafeStop للحرارة 38° مئوية وصمام قلب نحاس ألماني غير قابل للصدأ.',
    descriptionEn: 'Authentic German concealed thermostatic mixer keeping water temperature stable with 38°C SafeStop scalding lock.',
    specsAr: { 'النوع': 'خلاط دفن ثرموستاتيك', 'الخامة': 'نحاس مطلي كروم StarLight', 'عمق التأسيس': '70 إلى 100 مم', 'الضمان': '5 سنوات الوكيل' },
    specsEn: { 'Type': 'Concealed Thermostatic', 'Body': 'Brass Chrome StarLight', 'Rough-In Depth': '70 – 100 mm', 'Warranty': '5 Years Official' },
    dimensions: 'Box Rough-in 70–100 mm depth',
    capacity: 'Single Bathroom Full Shower',
    energyRating: 'A (EcoJoy)',
    warrantyMonths: 60,
    warrantyTermsAr: 'ضمان 5 سنوات من وكيل جروهي في مصر ضد عيوب القلب والمواد بشرط التأسيس الصحيح.',
    warrantyTermsEn: '5-year Grohe Egypt official warranty on cartridge & chrome coat when rough-in box is level-installed.',
    originCountryAr: 'ألمانيا (تصنيع مصنع جروهي المعتمد)',
    originCountryEn: 'Germany (Grohe Certified European Plant)',
    prosAr: [
      'تقنية TurboStat تمنع تغير حرارة المياه المفاجئ عند فتح حنفية أخرى بالشقة',
      'خامة كروم أصلية تقاوم ترسيب الأملاح في المياه المصرية',
      'تقنية EcoJoy توفر حتى 35% من استهلاك المياه دون ضعف التدفق',
    ],
    prosEn: [
      'TurboStat maintains exact heat even if another tap opens elsewhere in the flat',
      'Hard-wearing StarLight chrome resists Egyptian mineral hard-water limescale',
      'EcoJoy flow limiter cuts water consumption without weak spray sensation',
    ],
    consAr: [
      'يستلزم شراء صندوق الدفن (Rapido SmartBox) وتركيبه في مرحلة تأسيس السباكة قبل السيراميك!',
      'لا يصلح للشقق المشطبة جاهزة إلا بتكسير حائط الحمام',
    ],
    consEn: [
      'Must be paired with Rapido SmartBox rough-in DURING pre-tile plumbing phase',
      'Not retrofit-friendly into already tiled bathrooms without chiseling masonry',
    ],
    buyerWarningsAr: [
      'حذارِ من شراء خلاط الدفن قبل التأكد من سماكة طوب الحمام (أقل من 12 سم قد يخرق الجدار الخلفي عند الحفر!)',
      'افحص السخان: السخانات الضعيفة أو الغاز ذات الضغط المنخفض قد تعيق عمل الثرموستات بانتظام',
    ],
    buyerWarningsEn: [
      'Check masonry bathroom wall thickness (> 12 cm needed) before specifying concealed boxes',
      'Ensure adequate cold/hot water pressure (>= 1.5 bar) — weak instant heaters reduce thermostatic accuracy',
    ],
    recommendedForAr: 'الشقق قيد التشطيب من البداية ومشاريع الباقات المتميزة',
    recommendedForEn: 'Apartments currently in rough-in finishing stage & luxury bathroom upgrades',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: true,
  },
  {
    id: 'bride-p6',
    slug: 'philips-essential-xl-62l-airfryer',
    trousseauType: 'bride',
    category: 'appliances',
    categoryAr: 'أجهزة المطبخ الصغيرة والعجانات',
    categoryEn: 'Small Kitchen Appliances & Mixers',
    nameAr: 'قلاية هوائية فيليبس إسنشال XL ديجيتال 6.2 لتر 2000 وات — أسود',
    nameEn: 'Philips Essential XL Connected 6.2L 2000W Airfryer',
    brand: 'PHILIPS',
    model: 'HD9270/90',
    price: 8950,
    originalPrice: 10200,
    sku: 'PHL-AF-62L-BK',
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'سعة عائلية XL تكفي دجاجة كاملة أو 1.2 كجم بطاطس بتقنية Rapid Air لدهون أقل حتى 90%.',
    descriptionEn: 'Family-sized XL 6.2L basket cooks a whole chicken or 1.2 kg fries with Rapid Air starfish swirl airflow.',
    specsAr: { 'السعة': '6.2 لتر (1.2 كجم)', 'القدرة': '2000 وات', 'البرامج': '7 برامج ديجيتال', 'الضمان': 'سنتين دولي فيليبس' },
    specsEn: { 'Capacity': '6.2 Liters (1.2 KG)', 'Power': '2000W', 'Presets': '7 Touch Presets', 'Warranty': '2 Years Philips' },
    dimensions: '40 × 31.5 × 30.7 cm',
    capacity: '6.2 L',
    energyRating: 'A+',
    warrantyMonths: 24,
    warrantyTermsAr: 'ضمان سنتين عالمي ومحلي في مصر لدى مراكز صيانة فيليبس الرسمية.',
    warrantyTermsEn: '2-year global and local Philips Egypt service center coverage.',
    originCountryAr: 'تصميم هولندي — تجميع مصانع فيليبس المعتمدة',
    originCountryEn: 'Dutch Engineering (Philips Certified Assembly)',
    prosAr: [
      'بديل عملي جداً يغني العروسة عن القلي العميق ويختصر وقت التحضير اليومي بعد الزواج',
      'سلة قابلة للفك والتنظيف في غسالة الأطباق بسهولة',
      'توزيع حرارة متجانس لا يتطلب تقليب مستمر',
    ],
    prosEn: [
      'Huge everyday time-saver for newlyweds replacing messy deep fryers',
      'QuickClean removable non-stick basket is dishwasher-safe',
      'Starfish bottom design browns food evenly without frequent shaking',
    ],
    consAr: [
      'سحب 2000 وات مرتفع نسبياً ولا يُنصح بتشغيلها على مشترك مع الميكروويف في وقت واحد',
      'حجمها على الرخامة كبير نسبياً مقارنة بالموديل الـ 4.1 لتر',
    ],
    consEn: [
      '2000W draw must NOT share a multi-plug strip simultaneously with a kettle or microwave',
      'Occupies ~32×40 cm countertop footprint',
    ],
    buyerWarningsAr: [
      'لا تضعيها مباشرة أسفل خزائن المطبخ الخشبية أو الرخامية الضيقة — اتركي 15 سم أعلى المخرج الخلفي للحرارة',
      'الأحجام الصغيرة أقل من 4 لتر قد تضيق عند أول عزومة، فحجم 6.2 لتر مثالي لعروسين وعائلتهما',
    ],
    buyerWarningsEn: [
      'Leave 15 cm rear/top exhaust clearance away from laminate kitchen cabinetry',
      'Skip mini < 4L sizes if you host guests — 6.2L hits the sweet spot for couples + hosting',
    ],
    recommendedForAr: 'جهاز المطبخ العملي الأساسي لكل عروسة عصرية',
    recommendedForEn: 'Must-have daily appliance for modern newlywed kitchens',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: true,
  },
  {
    id: 'bride-p7',
    slug: 'braun-multiquick9-1200w-hand-blender',
    trousseauType: 'bride',
    category: 'appliances',
    categoryAr: 'أجهزة المطبخ الصغيرة والعجانات',
    categoryEn: 'Small Kitchen Appliances & Mixers',
    nameAr: 'هاند بلندر ومحضر طعام براون مالتي كويك 9 — 1200 وات ألماني مطور',
    nameEn: 'Braun MultiQuick 9 1200W Hand Blender & Compact Food Processor System',
    brand: 'BRAUN (ألمانيا)',
    model: 'MQ9147X',
    price: 7400,
    originalPrice: 8300,
    sku: 'BRN-HB-1200-MQ9',
    stock: 21,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'محرك ActiveBlade مرن يتحرك لأعلى وأسفل بموتور 1200 وات ليغنيكِ في كثير من الأحيان عن الكبة والبلندر المنفصل.',
    descriptionEn: 'ActiveBlade moving-shaft 1200W immersion system with 1.25L blender jug, chopper & whisk.',
    specsAr: { 'القدرة': '1200 وات', 'التقنية': 'ActiveBlade + iMode', 'الملحقات': 'مفرمة + دورق + مضرب + هراسة', 'الضمان': 'سنتين الوكيل' },
    specsEn: { 'Power': '1200W', 'Technology': 'ActiveBlade + iMode', 'Attachments': 'Blender Jug + Chopper + Whisk + Masher', 'Warranty': '2 Years' },
    dimensions: 'Box 29 × 19 × 40 cm',
    capacity: '1.25 L Processor + 600 ml Beaker',
    energyRating: 'A',
    warrantyMonths: 24,
    warrantyTermsAr: 'ضمان سنتين شامل من وكيل براون الرسمي في مصر على وحدة المحرك.',
    warrantyTermsEn: '2-year official Braun Egypt distributor warranty on motor handle.',
    originCountryAr: 'تصميم ألماني — صنع في رومانيا',
    originCountryEn: 'German Design — Made in Romania',
    prosAr: [
      'يختصر 3 أجهزة مختلفة داخل علبة واحدة موفرة للمساحة في دواليب المطبخ الصغيرة',
      'تقنية SplashControl تمنع طرطشة الشوربة والصلصات الساخنة',
      'كفاءة ممتازة في جرش الثلج والمكسرات دون تلف السكين',
    ],
    prosEn: [
      'Replaces bulky standalone blenders, saving critical drawer/cabinet space',
      'Anti-splash SplashControl bell keeps hot soup prep spotless',
      'High-torque 1200W blade handles frozen fruits and nuts effortlessly',
    ],
    consAr: [
      'يجب عدم تشغيله متواصلاً لأكثر من 45 ثانية في المهام الشاقة لإطالة عمر الموتور',
      'الدورق البلاستيك يجب غسله بالماء الفاتر وليس الغليان الشديد',
    ],
    consEn: [
      'Pulse in 30–45 second bursts on thick nut pastes to preserve motor thermal life',
      'Hand-wash clear plastic chopper bowls to keep lids crystal clear',
    ],
    buyerWarningsAr: [
      'عند شراء جهاز العروسة: الهاند بلندر الكامل بالملحقات يغني غالباً عن شراء كبة كبيرة وخلاط منفصل في الشقق الضيقة',
      'تأكدي من وجود ختم الوكيل العربي أو يونيفرسال على الضمان بالداخل',
    ],
    buyerWarningsEn: [
      'Full MQ9 kit helps brides skip buying redundant separate countertop blenders & choppers',
      'Check inner warranty booklet for stamped official distributor seal',
    ],
    recommendedForAr: 'كل عروسة تبحث عن عملية مطبخ متكاملة بأقل ازدحام للأجهزة',
    recommendedForEn: 'Brides optimizing cabinet storage with one multi-role German powerhouse',
    priceSource: 'GAWAZ INN Verified Official Distributor Tracker',
    priceUpdatedAt: '2026-11-08',
    isFeatured: false,
  },
];

export interface SeedOfferTemplate {
  merchantName: string;
  warrantyType: MerchantWarrantyType;
  priceDeltaPercent: number;
  deliverySlaAr: string;
  deliverySlaEn: string;
  inStock: boolean;
  notesAr?: string;
  notesEn?: string;
}

export function buildSeedPriceHistoryAndOffers(
  products: Product[],
): {
  priceHistory: ProductPricePoint[];
  merchantOffers: ProductMerchantOffer[];
  alternatives: {
    id: string;
    productId: string;
    alternativeProductId: string;
    relationType: AlternativeRelationType;
    reasonAr: string;
    reasonEn: string;
  }[];
} {
  const priceHistory: ProductPricePoint[] = [];
  const merchantOffers: ProductMerchantOffer[] = [];
  const months = ['2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01'];

  products.forEach((p, idx) => {
    // 4 realistic historical checkpoints converging honestly on p.price
    const multipliers = [0.95, 1.03, 1.01, 1.0];
    multipliers.forEach((m, mi) => {
      const val = mi === multipliers.length - 1 ? p.price : Math.round((p.price * m) / 50) * 50;
      priceHistory.push({
        id: `pph-${p.id}-${mi + 1}`,
        productId: p.id,
        merchantName: 'الوكيل الرسمي المعتمد',
        price: val,
        source: mi % 2 === 0 ? 'Official Distributor List' : 'Market Reference Track',
        recordedAt: months[mi],
      });
    });

    // 3 merchant offers comparing official warranty vs authorized dealer vs gray market caveat
    const officialPrice = p.price;
    const dealerPrice = Math.round((p.price * (1.02 + (idx % 3) * 0.01)) / 50) * 50;
    const importerPrice = Math.round((p.price * 0.91) / 50) * 50;

    merchantOffers.push(
      {
        id: `pmo-${p.id}-1`,
        productId: p.id,
        merchantName: p.brand.includes('SHARP') || p.brand.includes('TORNADO') ? 'توكيل ومعارض العربي الرسمية' : `معرض ${p.brand} الرسمي المعتمد`,
        warrantyType: 'official_agent',
        price: officialPrice,
        deliverySlaAr: 'شحن خلال 48–72 ساعة للمحافظات مع فاتورة ضريبية معتمدة',
        deliverySlaEn: '48–72h nationwide shipping + stamped official agent tax invoice',
        inStock: p.stock > 0,
        notesAr: 'تفعيل كامل للضمان الرسمي بدون شروط إضافية',
        notesEn: 'Full official Egyptian agent warranty activated automatically',
        updatedAt: '2026-11-08',
      },
      {
        id: `pmo-${p.id}-2`,
        productId: p.id,
        merchantName: 'موزع إلكترونيات وأجهزة معتمد (القاهرة الكبرى)',
        warrantyType: 'authorized_dealer',
        price: dealerPrice,
        deliverySlaAr: 'استلام فوري أو توصيل 24 ساعة مع تقسيط بنكي',
        deliverySlaEn: 'Same-day pickup or 24h Cairo delivery with bank installments',
        inStock: true,
        notesAr: 'متوافق مع عروض تقسيط فاليو وأمان والبنوك',
        notesEn: 'Supports official agent card & consumer finance installments',
        updatedAt: '2026-11-08',
      },
      {
        id: `pmo-${p.id}-3`,
        productId: p.id,
        merchantName: 'تاجر استيراد حر (سعر نقدي مخفض)',
        warrantyType: 'gray_market_importer',
        price: importerPrice,
        deliverySlaAr: 'شحن محلي 3–5 أيام (ضمان محل فقط)',
        deliverySlaEn: '3–5 day local dispatch (store warranty only)',
        inStock: idx % 2 === 0,
        notesAr: 'تنبيه وعي شرائي: السعر أقل لأنه قد لا يشمل كارت ضمان الوكيل المعتمد أو التركيب المجاني!',
        notesEn: 'Consumer Alert: Lower cash tag often excludes official local agent warranty & free installation!',
        updatedAt: '2026-11-08',
      },
    );
  });

  const alternatives: {
    id: string;
    productId: string;
    alternativeProductId: string;
    relationType: AlternativeRelationType;
    reasonAr: string;
    reasonEn: string;
  }[] = [
    {
      id: 'alt-1',
      productId: 'groom-p1',
      alternativeProductId: 'groom-p7',
      relationType: 'budget',
      reasonAr: 'بديل موفر بـ 12,600 ج.م وبعرض أضيق (64 سم) للمطابخ الصغيرة بنفس شبكة العربي',
      reasonEn: 'Saves 12,600 EGP with slimmer 64 cm footprint backed by El-Araby service',
    },
    {
      id: 'alt-2',
      productId: 'groom-p1',
      alternativeProductId: 'groom-p8',
      relationType: 'upgrade',
      reasonAr: 'ترقية بسعة 580 لتر ونظام تبريد مزدوج منفصل للمطابخ الواسعة',
      reasonEn: 'Upgrades to 580L family volume with isolated Twin Cooling Plus evaporators',
    },
    {
      id: 'alt-3',
      productId: 'groom-p7',
      alternativeProductId: 'groom-p1',
      relationType: 'upgrade',
      reasonAr: 'سعة أكبر 450 لتر وتقنية البلازما كلاستر لحفظ أطول',
      reasonEn: 'Larger 450L family capacity with Plasmacluster odor control',
    },
    {
      id: 'alt-4',
      productId: 'groom-p8',
      alternativeProductId: 'groom-p1',
      relationType: 'compact',
      reasonAr: 'بديل أعرض أماناً لأبواب المطبخ الضيقة (70 سم بدلاً من 83.6 سم) وأوفر بـ 18,400 ج.م',
      reasonEn: 'Passes standard 72cm doors effortlessly & saves 18,400 EGP',
    },
    {
      id: 'alt-5',
      productId: 'groom-p2',
      alternativeProductId: 'groom-p9',
      relationType: 'budget',
      reasonAr: 'بديل إنفرتر بخار اقتصادي A+++ يوفر 8,400 ج.م مع ضمان 5 سنوات بيكو',
      reasonEn: 'A+++ SteamCure Inverter alternative saving 8,400 EGP with 5-year warranty',
    },
    {
      id: 'alt-6',
      productId: 'groom-p9',
      alternativeProductId: 'groom-p2',
      relationType: 'upgrade',
      reasonAr: 'ترقية لسعة 9 كجم وسرعة عصر 1400 لفة وموتور Direct Drive دفع مباشر',
      reasonEn: 'Upgrades to 9KG drum, 1400 RPM spin & beltless Direct Drive motor',
    },
    {
      id: 'alt-7',
      productId: 'groom-p10',
      alternativeProductId: 'groom-p11',
      relationType: 'compact',
      reasonAr: 'لغرف النوم (10–14 م²) فقط: يوفر 15,600 ج.م بدلاً من المبالغة بقدرة 2.25 حصان',
      reasonEn: 'Sized for 10–14m² bedrooms & saves 15,600 EGP over oversized 2.25 HP units',
    },
    {
      id: 'alt-8',
      productId: 'groom-p11',
      alternativeProductId: 'groom-p10',
      relationType: 'upgrade',
      reasonAr: 'ترقية لقدرة 2.25 حصان إنفرتر بارد/ساخن للصالات والأدوار الشمسية المكشوفة',
      reasonEn: 'Upgrades to 2.25 HP tropical Inverter heat/cool for receptions up to 24m²',
    },
    {
      id: 'alt-9',
      productId: 'bride-p4',
      alternativeProductId: 'bride-p7',
      relationType: 'compact',
      reasonAr: 'بديل ألماني مدمج وموفر بـ 21,000 ج.م للمطابخ الصغيرة والاستخدام السريع اليومي',
      reasonEn: 'Space-saving German multi-processor saving 21,000 EGP in compact kitchens',
    },
    {
      id: 'alt-10',
      productId: 'bride-p7',
      alternativeProductId: 'bride-p6',
      relationType: 'upgrade',
      reasonAr: 'مكمل مثالي للمطبخ العصري لقلي وشوي 1.2 كجم بأقل دهون',
      reasonEn: 'Pairs smoothly as a 6.2L healthy daily airfryer partner',
    },
  ];

  return { priceHistory, merchantOffers, alternatives };
}

const ENERGY_SCORE_RANK: Record<string, number> = {
  'A+++': 6,
  'A++': 5,
  'A+': 4,
  'A (EcoJoy)': 4,
  A: 3,
  B: 2,
  C: 1,
};

export function compareProductsAnalysis(
  products: Product[],
  offersByProductId: Record<string, ProductMerchantOffer[]>,
): ProductComparisonMatrixPayload {
  let lowestPriceProductId: string | undefined;
  let longestWarrantyProductId: string | undefined;
  let bestEnergyProductId: string | undefined;
  let bestWarrantyValueProductId: string | undefined;

  let minPrice = Number.POSITIVE_INFINITY;
  let maxWarranty = -1;
  let maxEnergyRank = -1;
  let bestCostPerWarrantyYear = Number.POSITIVE_INFINITY;

  const keysArSet = new Set<string>();
  const keysEnSet = new Set<string>();

  for (const p of products) {
    if (p.price < minPrice) {
      minPrice = p.price;
      lowestPriceProductId = p.id;
    }
    const wMonths = p.warrantyMonths ?? 12;
    if (wMonths > maxWarranty) {
      maxWarranty = wMonths;
      longestWarrantyProductId = p.id;
    }
    const eRank = p.energyRating ? ENERGY_SCORE_RANK[p.energyRating] ?? 0 : 0;
    if (eRank > maxEnergyRank && eRank > 0) {
      maxEnergyRank = eRank;
      bestEnergyProductId = p.id;
    }
    const wYears = Math.max(0.5, wMonths / 12);
    const costPerYear = p.price / wYears;
    if (costPerYear < bestCostPerWarrantyYear) {
      bestCostPerWarrantyYear = costPerYear;
      bestWarrantyValueProductId = p.id;
    }
    Object.keys(p.specsAr || {}).forEach((k) => keysArSet.add(k));
    Object.keys(p.specsEn || {}).forEach((k) => keysEnSet.add(k));
  }

  return {
    products,
    offersByProductId,
    highlights: {
      lowestPriceProductId,
      longestWarrantyProductId,
      bestEnergyProductId,
      bestWarrantyValueProductId,
    },
    unifiedSpecKeysAr: Array.from(keysArSet),
    unifiedSpecKeysEn: Array.from(keysEnSet),
  };
}
