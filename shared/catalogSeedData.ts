import { 
  FinishingPackage, 
  FinishingService, 
  Product, 
  TrousseauPackage, 
  WeddingServiceItem, 
  PlatformSettings,
  FinishingInquiry,
  WeddingBookingRequest,
  Order,
  FinancingApplication,
  SupportCase
} from './types';

export const initialSettings: PlatformSettings = {
  brandNameAr: 'جواز إن',
  brandNameEn: 'GAWAZ INN',
  sloganAr: 'من أول الشقة.. لحد ليلة العمر.',
  sloganEn: 'From Apartment Keys.. To Your Dream Wedding.',
  hotline: '19742',
  whatsapp: '+201023456789',
  email: 'concierge@gawazinn.com',
  addressAr: 'مبنى جواز إن، التجمع الخامس، القاهرة الجديدة، مصر',
  addressEn: 'GAWAZ INN Tower, 5th Settlement, New Cairo, Egypt',
  activeInstallmentProviders: ['valU (ڤاليو)', 'Souhoola (سهولة)', 'Aman (أمان)', 'Contact (كونتكت)', 'Forsa (فرصة)', 'بنك مصر (Banque Misr)', 'البنك الأهلي المصري (NBE)'],
  interestRateAnnual: 14.5,
  enableFinancing: true,
  enableSocialSupport: true,
  currencyAr: 'ج.م',
  currencyEn: 'EGP',
};

// Section 1: Finishing Packages & Services
export const initialFinishingPackages: FinishingPackage[] = [
  {
    id: 'pack-economic',
    nameAr: 'باقة التوفير (سوبر لوكس)',
    nameEn: 'Economy Super-Lux Package',
    tier: 'economic',
    pricePerMeter: 3400,
    descriptionAr: 'تشطيب عصري بجودة ممتازة وخامات معتمدة وضمان سنتين، مثالي للميزانيات الاقتصادية والبدء السريع.',
    descriptionEn: 'Modern finishing with certified materials, 2-year warranty, ideal for budget-conscious couples.',
    featuresAr: [
      'تأسيس سباكة مواسير باننجر ألماني ضمان معتمد',
      'تأسيس كهرباء أسلاك السويدي أصلية 100%',
      'سيراميك فرز أول لجميع الأرضيات والحمامات والمطبخ (كليوباترا / ليسيكو)',
      'دهانات كمبيوتر جوتن أو سايبس وشين معجون ووشين تشطيب',
      'أبواب غرف موسكي وش باب شقة مصفح تركي',
      'شبابيك ألوميتال بي إس صغير زجاج عاكس',
      'إشراف هندسي وضمان شامل 24 شهراً'
    ],
    featuresEn: [
      'German Bänninger certified plumbing infrastructure',
      'Original El-Sewedy electric wiring 100%',
      'First-class ceramic tiles for all rooms, baths & kitchen',
      'Jotun / Sipes computerized paints (2 prep coats + 2 finish)',
      'Solid wood interior doors + Turkish armored entrance door',
      'BS aluminum windows with reflective acoustic glass',
      'Architectural supervision with 24-month comprehensive warranty'
    ],
    recommendedForAr: 'شقق الشباب والمساحات من 80 إلى 130 متر',
    recommendedForEn: 'Young couples & apartments from 80m² to 130m²',
    badge: 'الأكثر طلباً'
  },
  {
    id: 'pack-medium',
    nameAr: 'الباقة المتوسطة المتوازنة (لوكس متكامل)',
    nameEn: 'Balanced Medium Package (Complete Lux)',
    tier: 'medium',
    pricePerMeter: 4300,
    descriptionAr: 'توازن عملي بين التكلفة والمظهر الفندقي العصري مع عزل متقن وأطقم حمامات ودهانات قابلة للغسيل.',
    descriptionEn: 'Practical balance between cost and contemporary finishes with moisture-proof insulation and washable paints.',
    featuresAr: [
      'عزل كامل للحمامات والمطبخ قبل أعمال السباكة',
      'بورسلين مصري فاخر للاستقبال مع HDF تركي 8 مم للغرف',
      'جبسن بورد في الصالة والممرات مع سبوتات ليد موفرة',
      'أطقم خلاطات حمامات معتمدة بضمان 5 سنوات',
      'إشراف هندسي أسبوعي وجدول تسليم زمني مكتوب'
    ],
    featuresEn: [
      'Full waterproof membrane in bathrooms & kitchen before tiling',
      'Premium Egyptian porcelain reception & 8mm HDF bedroom flooring',
      'Gypsum ceiling drops in living & hallways with warm LED spots',
      '5-year warranty sanitary mixers and brass valves',
      'Weekly site engineering supervision & written delivery timeline'
    ],
    recommendedForAr: 'الشقق من 100 إلى 160 متر الباحثة عن جودة أعلى بميزانية منضبطة',
    recommendedForEn: 'Apartments 100–160m² seeking durable upgraded finishes on a balanced budget',
    badge: 'توازن القيمة'
  },
  {
    id: 'pack-luxury',
    nameAr: 'الباقة المتميزة (ألترا لوكس)',
    nameEn: 'Premium Ultra-Lux Package',
    tier: 'luxury',
    pricePerMeter: 5200,
    descriptionAr: 'المستوى الراقي الذي يجمع بين الفخامة واللمسات الديكورية العصرية مع إضاءات ليد مخفية وجبسن بورد كامل.',
    descriptionEn: 'Sophisticated luxury combining modern decor, concealed LED lighting and full gypsum board ceiling design.',
    featuresAr: [
      'تأسيس سباكة وكهرباء سمارت مع مخارج تكييفات لجميع الغرف',
      'أرضيات بورسلين إسباني ومستورد للاستقبال وغرف نوم HDF سويسري',
      'ديكورات جبسن بورد حديثة لكامل الشقة مع بيوت نور وشريط ليد بروفايل',
      'أطقم حمامات ديورافيت / أيديال ستاندرد مع دفان جروهي ألماني',
      'دهانات ديكورية حديثة جوتن فينوماستيك المقاومة للغسيل',
      'أبواب غرف قشرة أرو ودهان استر وباب شقة مصفح إيطالي سمارت',
      'تصميم 3D تفصيلي مجاني قبل بدء الأعمال مع مهندس ديكور مخصص'
    ],
    featuresEn: [
      'Smart plumbing and electrical grid with pre-installed AC conduits',
      'Imported Spanish porcelain for reception & Swiss HDF for bedrooms',
      'Contemporary full gypsum board ceiling with concealed LED profiles',
      'Duravit / Ideal Standard sanitary fixtures + Grohe German concealed flush',
      'Jotun Fenomastic washable designer wall paints',
      'Oak veneer interior doors + Smart Italian armored entrance door',
      'Complimentary 3D architectural render before execution with dedicated interior designer'
    ],
    recommendedForAr: 'الشقق من 120 إلى 220 متر في المجتمعات العمرانية والكمبوندات',
    recommendedForEn: 'Apartments from 120m² to 220m² in gated communities & modern districts',
    badge: 'خيار المهندسين'
  },
  {
    id: 'pack-ultra',
    nameAr: 'باقة الرفاهية الملكية (VIP Smart)',
    nameEn: 'Royal VIP Smart Home Package',
    tier: 'ultra_luxury',
    pricePerMeter: 7800,
    descriptionAr: 'قمة الرفاهية والأناقة مع رخام مستورد ونظام تحكم ذكي كامل بالشقة وتصميمات استثنائية تسلم بالمفتاح.',
    descriptionEn: 'The pinnacle of luxury featuring imported marble, full smart home automation, and bespoke architectural finishes.',
    featuresAr: [
      'نظام سمارت هوم متكامل (تحكم بالإضاءة، التكييف، الستائر، وبصمة الدخول)',
      'أرضيات استقبال رخام مستورد (كرارا / بريشيا / إمبرادور) مع معالجة وتلميع كريستال',
      'مطابخ خشبية مودرن (بولي لاك / كاونترتوب كوارتز / أجهزة بلت إن متوافقة)',
      'حمامات ماستر مزودة بكابينة شاور زجاج سيكوريت 10 مم وجاكوزي',
      'شبابيك جامبو عازلة للصوت والحرارة بزجاج دبل جورجيا',
      'دريسنج روم متكامل مصمم حسب المساحة بخشب MDF معالج',
      'إشراف استشاري دوري وتقرير أسبوعي مصور وضمان ممتد 5 سنوات'
    ],
    featuresEn: [
      'Full Smart Home automation (lighting, AC, motorized curtains, biometric access)',
      'Imported marble flooring (Carrara / Emperador) with diamond crystal polish',
      'Modern kitchen cabinetry (Polylac / Quartz countertop / built-in appliance prep)',
      'Master bathroom with 10mm Securit glass walk-in shower & whirlpool tub',
      'Jumbo soundproof and thermal acoustic double-glazed windows',
      'Fully fitted custom Walk-in Dressing Room in treated wood',
      'Weekly photo progress reports, consulting architect oversight, 5-year extended warranty'
    ],
    recommendedForAr: 'الفلل والوحدات الفاخرة والمساحات الكبيرة',
    recommendedForEn: 'Luxury penthouses, villas & expansive residences',
    badge: 'باقة كبار الشخصيات'
  }
];

export const initialFinishingServices: FinishingService[] = [
  {
    id: 'serv-interior-design',
    titleAr: 'التصميم الداخلي والديكور 3D',
    titleEn: 'Interior 3D Design & Space Planning',
    descriptionAr: 'توزيع فراغات وتصميم ديكوري ثلاثي الأبعاد واقعي بالكامل قبل وضع مسمار واحد في الشقة.',
    descriptionEn: 'Hyper-realistic 3D interior design & architectural space planning before touching a single nail.',
    iconName: 'Compass',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    startingPricePerMeter: 120,
    durationDays: '7 - 14 يوم',
    includedItemsAr: ['مخطط توزيع الفرش 2D', 'ريندرات 3D واقعية 4K', 'لوحات تنفيذية لكهرباء وسباكة وأسقف', 'جدول حصر الكميات والمواد'],
    includedItemsEn: ['2D Furniture layout plan', '4K Photorealistic 3D renders', 'Executive architectural shop drawings', 'Bill of quantities & material specifications']
  },
  {
    id: 'serv-plumbing-elec',
    titleAr: 'تأسيس السباكة والكهرباء',
    titleEn: 'Plumbing & Electrical Infrastructure',
    descriptionAr: 'أهم مراحل التشطيب التي لا تقبل التهاون، بأجود الخامات الألمانية والمصرية مع شهادة ضغط واختبار رسمية.',
    descriptionEn: 'The critical foundational stage, executed with top certified piping, copper cables, and hydrostatic pressure certification.',
    iconName: 'Zap',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    startingPricePerMeter: 650,
    durationDays: '15 - 20 يوم',
    includedItemsAr: ['مواسير مياه وصرف معتمدة بضمان 20 سنة', 'أسلاك كهرباء نحاس أصلية وتأسيس لوحات قواطع', 'مخارج تكييفات ودش ونت مركزي', 'شهادة اختبار ضغط رسمية من الشركة المصنعة'],
    includedItemsEn: ['Certified water & drainage pipes with 20yr factory guarantee', 'El-Sewedy pure copper cables & main breaker panel', 'Central AC, TV dish & LAN wiring conduits', 'Official hydrostatic pressure test certificate']
  },
  {
    id: 'serv-painting-gypsum',
    titleAr: 'الدهانات والديكورات الحديثة',
    titleEn: 'Designer Paints & Modern Gypsum',
    descriptionAr: 'معالجة جدران احترافية بأربع طبقات تأسيس مع دهانات فاخرة وجبسن بورد فرنسي خالي من التشققات.',
    descriptionEn: 'Professional 4-layer wall preparation, luxury anti-stain paints and seamless French gypsum board.',
    iconName: 'Palette',
    imageUrl: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?auto=format&fit=crop&w=800&q=80',
    startingPricePerMeter: 480,
    durationDays: '15 - 25 يوم',
    includedItemsAr: ['صنفرة ومعجون دايتون وسيلر تأسيسي', 'جبسن بورد كناوف أخضر للحمامات والمطابخ', 'شريط شاش ومعجون فواصل لمنع أي تشقق', 'ألوان كمبيوتر مخصصة ووشين نهائيين'],
    includedItemsEn: ['Thorough sanding, acrylic sealer & filler', 'Moisture-resistant Knauf gypsum for wet areas', 'Fiberglass mesh tape on all joints', 'Computerized color tinting with double final coat']
  },
  {
    id: 'serv-kitchens-dressing',
    titleAr: 'المطابخ المودرن والدريسنج روم',
    titleEn: 'Custom Kitchens & Dressing Rooms',
    descriptionAr: 'تصنيع حسب المقاس بأخشاب مقاومة للمياه والحرارة (بولي لاك، يوفي لاك، HPL) وإكسسوارات بلوم هيدروليك.',
    descriptionEn: 'Custom made-to-measure cabinetry in waterproof Polylac / HPL with soft-close Blum German hardware.',
    iconName: 'LayoutGrid',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    startingPricePerMeter: 2900,
    durationDays: '20 - 30 يوم',
    includedItemsAr: ['شاسيه خشب طبيعي أو كونتر معالج', 'مفصلات ومجاري إدراج باكم سوفت كلوز', 'رخام صناعي كوارتز أو جرانيت دبل بلاك', 'إضاءات ليد داخلية مع سينسور فتح الأبواب'],
    includedItemsEn: ['Treated marine core ply chassis', 'Hydraulic soft-close hinges & slides', 'Quartz engineered stone or Black Absolute granite', 'Internal sensor LED wardrobe lighting']
  }
];

export const liveFinishingProjects = [
  {
    id: 'proj-1',
    titleAr: 'تشطيب شقة التجمع الخامس — حي البنفسج',
    titleEn: 'New Cairo Apartment — Al-Banafsaj District',
    area: '185 م²',
    tierAr: 'ألترا لوكس ديكوري',
    tierEn: 'Ultra Lux Interior',
    durationAr: '65 يوماً',
    durationEn: '65 Days',
    beforeImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'تحويل شقة طوب أحمر إلى تحفة معمارية عصرية مع فتح المطبخ أمريكان ستايل وأرضيات بورسلين إسباني.',
    descriptionEn: 'Transformation of raw red-brick unit into modern open-concept haven with Spanish porcelain reception.'
  },
  {
    id: 'proj-2',
    titleAr: 'تشطيب دوبلكس الشيخ زايد — كمبوند بيفرلي هيلز',
    titleEn: 'Sheikh Zayed Duplex — Beverly Hills Compound',
    area: '260 م²',
    tierAr: 'باقة الرفاهية الملكية VIP',
    tierEn: 'Royal VIP Package',
    durationAr: '90 يوماً',
    durationEn: '90 Days',
    beforeImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'رخام كرارا إيطالي، نظام إضاءة ذكي سمارت، دريسنج روم متكامل لكل غرفة، وتدفئة أرضيات للحمامات.',
    descriptionEn: 'Italian Carrara marble, smart home automation, custom walk-in closets, and master en-suite sanctuary.'
  },
  {
    id: 'proj-3',
    titleAr: 'تشطيب شقة المعادي — دجلة الجديدة',
    titleEn: 'Maadi Apartment — Degla Palms',
    area: '110 م²',
    tierAr: 'باقة التوفير سوبر لوكس',
    tierEn: 'Economy Super Lux',
    durationAr: '45 يوماً',
    durationEn: '45 Days',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'استغلال أمثل للمساحات الصغيرة مع ديكورات مودرن بأقل تكلفة ممكنة مع إشراف هندسي وضمان شامل.',
    descriptionEn: 'Optimal space utilization for cozy modern living with certified plumbing & electrical warranties.'
  }
];

// Section 2: Groom's Trousseau Products & Packages
export const initialGroomProducts: Product[] = [
  {
    id: 'groom-p1',
    trousseauType: 'groom',
    category: 'appliances',
    categoryAr: 'الأجهزة الكهربائية الكبيرة',
    categoryEn: 'Major Home Appliances',
    nameAr: 'ثلاجة شارب ديجيتال نوفروست 450 لتر إنفرتر — أسود زجاجي',
    nameEn: 'Sharp Digital No-Frost Inverter Refrigerator 450L — Glass Black',
    brand: 'SHARP (العربي)',
    price: 36500,
    originalPrice: 39900,
    sku: 'SHP-REF-450-BK',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'تكنولوجيا البلازما كلاستر لمنع البكتيريا والروائح الكريهة مع محرك إنفرتر موفر للطاقة وضمان 10 سنوات.',
    descriptionEn: 'Plasmacluster ion technology, J-Tech Inverter energy-saving motor, 10-year official warranty.',
    specsAr: { 'السعة': '450 لتر', 'اللون': 'زجاج أسود فاخر', 'الضمان': '10 سنوات العربي', 'الإنفرتر': 'نعم موفر للكهرباء' },
    specsEn: { 'Capacity': '450 Liters', 'Color': 'Glossy Black Glass', 'Warranty': '10 Years Official', 'Inverter': 'Yes Energy-Saving' },
    isFeatured: true
  },
  {
    id: 'groom-p2',
    trousseauType: 'groom',
    category: 'appliances',
    categoryAr: 'الأجهزة الكهربائية الكبيرة',
    categoryEn: 'Major Home Appliances',
    nameAr: 'غسالة إل جي أوتوماتيك 9 كيلو بالبخار ونظام الذكاء الاصطناعي AI DD',
    nameEn: 'LG Front Load Washing Machine 9KG Steam & AI DD Sensor',
    brand: 'LG',
    price: 29800,
    originalPrice: 32500,
    sku: 'LG-WSH-9KG-SLV',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'محرك الدفع المباشر إنفرتر مع تعقيم بالبخار 99.9% والتحكم عبر تطبيق ThinQ بالواي فاي.',
    descriptionEn: 'Inverter Direct Drive motor, 99.9% allergy steam removal, Smart ThinQ WiFi connectivity.',
    specsAr: { 'الحمولة': '9 كجم', 'سرعة العصر': '1400 لفة/دقيقة', 'التقنية': 'بخار ومستشعر ذكي', 'الضمان': '10 سنوات للموتور' },
    specsEn: { 'Load Capacity': '9 KG', 'Spin Speed': '1400 RPM', 'Feature': 'Steam Allergy Care', 'Motor Warranty': '10 Years' },
    isFeatured: true
  },
  {
    id: 'groom-p3',
    trousseauType: 'groom',
    category: 'electronics',
    categoryAr: 'الشاشات والصوتيات',
    categoryEn: 'Smart TVs & Electronics',
    nameAr: 'شاشة سامسونج سمارت 65 بوصة 4K Crystal UHD بنظام Tizen مع ريموت طاقة شمسية',
    nameEn: 'Samsung 65" 4K Crystal UHD Smart TV with SolarCell Remote',
    brand: 'SAMSUNG',
    price: 26900,
    originalPrice: 29500,
    sku: 'SAM-TV-65-UHD',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'معالج كريستال 4K لألوان طبيعية نابضة بالحياة، صوت محيطي متكيف، وتطبيقات شاهد ونتفليكس ويوتيوب مدمجة.',
    descriptionEn: 'Crystal Processor 4K, adaptive sound, bezel-less design with preloaded Shahid & streaming apps.',
    specsAr: { 'الحجم': '65 بوصة', 'الدقة': '4K UHD (3840 x 2160)', 'نظام التشغيل': 'Tizen OS', 'الضمان': 'سنتين سامسونج مصر' },
    specsEn: { 'Screen Size': '65 Inch', 'Resolution': '4K UHD (3840x2160)', 'OS': 'Tizen OS', 'Warranty': '2 Years Official' },
    isFeatured: true
  },
  {
    id: 'groom-p4',
    trousseauType: 'groom',
    category: 'appliances',
    categoryAr: 'الأجهزة الكهربائية الكبيرة',
    categoryEn: 'Major Home Appliances',
    nameAr: 'بوتاجاز فريش بلاتينيوم 5 شعلة 60×90 سم أمان كامل ومروحة فرن مزدوجة',
    nameEn: 'Fresh Platinum 5-Burner Gas Cooker 60x90 Full Safety & Dual Convection',
    brand: 'FRESH',
    price: 18400,
    originalPrice: 20200,
    sku: 'FRS-CKR-90-SS',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'سطح ستانلس ستيل عريض، شعلات نحاسية سباف إيطالية، حوامل زهر ثقيلة، وشواية دوارة أوتوماتيكية.',
    descriptionEn: 'Italian Sabaf brass burners, heavy cast iron pan supports, full flame safety auto cut-off.',
    specsAr: { 'المقاس': '60 * 90 سم', 'الشعلات': '5 شعلة غاز', 'الأمان': 'أمان كامل 100%', 'الضمان': '5 سنوات' },
    specsEn: { 'Dimensions': '60 x 90 cm', 'Burners': '5 Sabaf Burners', 'Safety': '100% Full Flame Failure', 'Warranty': '5 Years' }
  },
  {
    id: 'groom-p5',
    trousseauType: 'groom',
    category: 'bedroom',
    categoryAr: 'غرف النوم والأثاث',
    categoryEn: 'Master Bedroom & Furniture',
    nameAr: 'غرفة نوم ماستر مودرن ملكية كاملة — خشب زان روماني وقشرة جوز طبيعي',
    nameEn: 'Royal Modern Master Bedroom Set — Romanian Beech & Natural Walnut',
    brand: 'Gawaz Inn Luxury Home',
    price: 68000,
    originalPrice: 76000,
    sku: 'GIN-BED-ROYAL-01',
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'تتكون من: سرير كينج 180 سم منجد بجلد مقلوب فاخر، دولاب جرار دريسنج 260 سم مع إضاءة ليد، تسريحة بانوراما بمرآة ذكية، و2 كومود.',
    descriptionEn: 'Includes: King bed 180cm with luxury upholstered headboard, 260cm sliding closet with LED sensors, vanity with smart LED touch mirror, and 2 nightstands.',
    specsAr: { 'الخامات': 'خشب زان روماني وقشرة جوز', 'مقاس السرير': '180 * 200 سم', 'مقاس الدولاب': '260 * 220 سم', 'الضمان': '10 سنوات على الهيكل' },
    specsEn: { 'Materials': 'Romanian Beech Wood & Walnut', 'Bed Size': '180 x 200 cm', 'Wardrobe': '260 x 220 cm', 'Warranty': '10 Years Structural' },
    isFeatured: true
  },
  {
    id: 'groom-p6',
    trousseauType: 'groom',
    category: 'living',
    categoryAr: 'الصالون والليفينج',
    categoryEn: 'Living Room & Salon',
    nameAr: 'ركنة ليفينج مودرن أمريكان L-Shape إسفنج كثافة 33 سوفت مع قماش معالج ضد البقع',
    nameEn: 'Modern L-Shape Sectional Sofa — High-Density 33 Foam & Stain-Resistant Fabric',
    brand: 'Gawaz Inn Living',
    price: 24500,
    originalPrice: 28000,
    sku: 'GIN-SOF-MOD-L',
    stock: 9,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'تصميم مريح وأنيق بمقاس 300×200 سم، مع خشب زان أحمر وشلت منفصلة قابلة للغسيل وبوف إضافي مجاني.',
    descriptionEn: 'Ergonomic 300x200cm layout, red beech frame, removable washable covers with matching complimentary ottoman.',
    specsAr: { 'المقاس': '300 * 200 سم', 'الخشب': 'زان أحمر مجفف', 'الإسفنج': 'كثافة 33 سوفت دنلوب', 'الضمان': '5 سنوات' },
    specsEn: { 'Dimensions': '300 x 200 cm', 'Frame': 'Kiln-Dried Red Beech', 'Cushion': 'Density 33 Dunlop Soft', 'Warranty': '5 Years' }
  }
];

export const initialGroomPackages: TrousseauPackage[] = [
  {
    id: 'pack-groom-eco',
    trousseauType: 'groom',
    nameAr: 'باقة العريس التوفيرية (الأساسيات الأكيدة)',
    nameEn: 'Groom Essential Value Package',
    taglineAr: 'كل الأجهزة الكهربائية الأساسية من الماركات الموثوقة بخصم 15%',
    taglineEn: 'All core major appliances from trusted Egyptian agents with 15% discount',
    totalPrice: 94000,
    originalPrice: 112000,
    savings: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    itemsCount: 5,
    itemsAr: [
      'ثلاجة شارب 450 لتر نوفروست إنفرتر',
      'غسالة إل جي أوتوماتيك 8 كيلو بالبخار',
      'شاشة سامسونج 55 بوصة سمارت 4K',
      'بوتاجاز فريش 5 شعلة أمان كامل',
      'سخان غاز تورنيدو 10 لتر ديجيتال هدية'
    ],
    itemsEn: [
      'Sharp 450L No-Frost Inverter Refrigerator',
      'LG 8KG Steam Front-Load Washer',
      'Samsung 55" 4K Smart UHD TV',
      'Fresh 5-Burner Gas Cooker Full Safety',
      'Complimentary Tornado 10L Digital Gas Water Heater'
    ],
    popular: true
  },
  {
    id: 'pack-groom-royal',
    trousseauType: 'groom',
    nameAr: 'باقة العريس الملكية (أجهزة كهربائية + أثاث ماستر)',
    nameEn: 'Groom Royal Complete Package',
    taglineAr: 'تجهيز شامل للأجهزة الكبيرة وغرفة النوم والركنة بضمان معتمد',
    taglineEn: 'Comprehensive package with flagship appliances and bespoke master bedroom',
    totalPrice: 178000,
    originalPrice: 206000,
    savings: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    itemsCount: 8,
    itemsAr: [
      'ثلاجة شارب زجاجي 450 لتر ديجيتال',
      'غسالة إل جي 9 كيلو بخار AI DD',
      'شاشة سامسونج 65 بوصة 4K الترا',
      'بوتاجاز فريش بلاتينيوم 5 شعلة 90 سم',
      'غرفة نوم ماستر مودرن كاملة خشب زان',
      'ركنة ليفينج أمريكان مودرن 3×2 متر',
      'شاشة إضافية 43 بوصة لغرفة النوم مجاناً',
      'توصيل وتركيب مجاني لكافة الأجهزة والأثاث'
    ],
    itemsEn: [
      'Sharp 450L Glass Black Inverter Fridge',
      'LG 9KG Steam Washer with AI DD',
      'Samsung 65" 4K Crystal UHD TV',
      'Fresh Platinum 90cm 5-Burner Cooker',
      'Bespoke Beech Master Bedroom Set Complete',
      'Modern L-Shape Sectional Sofa (3x2m)',
      'Free 43" Smart TV for Master Bedroom',
      'Free nationwide delivery & white-glove installation'
    ],
    popular: true
  }
];

// Section 3: Bride's Trousseau Products & Packages
export const initialBrideProducts: Product[] = [
  {
    id: 'bride-p1',
    trousseauType: 'bride',
    category: 'cookware',
    categoryAr: 'أطقم الحلل وأواني الطهي',
    categoryEn: 'Cookware & Granite Pot Sets',
    nameAr: 'طقم حلل جرانيت تركي كوركماز أوريجينال 11 قطعة — تيتانيوم مانع للالتصاق',
    nameEn: 'Korkmaz Turkish Original 11-Piece Granite Cookware Set — Titanium Non-Stick',
    brand: 'KORKMAZ (تركيا)',
    price: 11800,
    originalPrice: 13500,
    sku: 'KRK-GRN-11PC',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'خالي 100% من مادة PFOA الضارة، أغطية بايركس مقاومة للصدمات الحرارية، وقواعد توزيع حراري سريعة.',
    descriptionEn: '100% PFOA-free organic coating, thermal shock-resistant tempered glass lids, turbo induction base.',
    specsAr: { 'عدد القطع': '11 قطعة (4 حلل + مقلاة + صينية)', 'المنشأ': 'صنع في تركيا', 'الطبقات': '7 طبقات تيتانيوم صلب', 'الضمان': 'سنتين الوكيل' },
    specsEn: { 'Piece Count': '11 Pieces (4 pots + pan + baking tray)', 'Origin': 'Made in Turkey', 'Coating': '7-Layer Titanium Granite', 'Warranty': '2 Years' },
    isFeatured: true
  },
  {
    id: 'bride-p2',
    trousseauType: 'bride',
    category: 'dinnerware',
    categoryAr: 'أطقم الصيني والمائدة والكرستال',
    categoryEn: 'Fine China, Tableware & Crystal',
    nameAr: 'طقم صيني عظمي ألماني فتحي محمود رويال 124 قطعة مذهب عيار 24',
    nameEn: 'Royal Bone China 124-Piece Dinner Set — 24K Gold Trimmed',
    brand: 'Fathi Mahmoud Royal',
    price: 24900,
    originalPrice: 28500,
    sku: 'FTH-CHN-124-GLD',
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'أفخر خامات البورسلين العظمي الشفاف، بنقوش ذهبية نبيلة عيار 24 مقاومة للغسيل والخدش، يكفي 12 فرداً بالكامل.',
    descriptionEn: 'Ultra-refined translucent bone china with 24-karat gold filigree detailing, full banquet service for 12 persons.',
    specsAr: { 'عدد القطع': '124 قطعة متكاملة', 'الخدمة': 'طقم عشاء وشاي وجاتوه وسلطانيات لـ 12 فرد', 'الذهب': 'ذهب حقيقي عيار 24 معالج', 'الحفظ': 'كرتونة تغليف فاخرة' },
    specsEn: { 'Total Pieces': '124 Complete Set', 'Capacity': 'Full Service for 12 Guests', 'Gold Trim': 'Treated 24K Gold Luster', 'Packaging': 'Padded Luxury Crate' },
    isFeatured: true
  },
  {
    id: 'bride-p3',
    trousseauType: 'bride',
    category: 'linens',
    categoryAr: 'المفروشات والملايات ومفارش السرير',
    categoryEn: 'Luxury Turkish Bedding & Linens',
    nameAr: 'مفرش سرير عروسة تركي ملكي ستان كافيار مطرز بالدانتيل واللؤلؤ 6 قطع',
    nameEn: 'Turkish Bridal Bedspread Set — Caviar Satin with French Lace & Pearl Accents',
    brand: 'Taç (تاش التركية)',
    price: 8900,
    originalPrice: 10500,
    sku: 'TAC-BED-CAV-6PC',
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'المفرش الأساسي لليلة الدخلة وسرير العروسة، أقمشة تركية ناعمة مقاومة للانكماش مع وسائد ديكورية مطرزة يدوياً.',
    descriptionEn: 'The signature bridal master suite spread, premium Turkish silky satin with hand-appliquéd French lace.',
    specsAr: { 'المحتويات': 'مفرش كينج 260×260 سم + 4 خدادية + كوشن أسطواني', 'اللون': 'أوف وايت عاجي فاخر', 'الخامة': 'ستان تركي مبرد كافيار', 'الغسيل': 'تنظيف جاف' },
    specsEn: { 'Contents': 'King spread 260x260cm + 4 pillow shams + bolster', 'Color': 'Royal Ivory Off-White', 'Fabric': 'Turkish Caviar Satin', 'Care': 'Dry Clean Preferred' },
    isFeatured: true
  },
  {
    id: 'bride-p4',
    trousseauType: 'bride',
    category: 'appliances',
    categoryAr: 'أجهزة المطبخ الصغيرة والعجانات',
    categoryEn: 'Small Kitchen Appliances & Mixers',
    nameAr: 'عجان ومحضر طعام كينوود تيتانيوم شيف باتيسيير 1400 وات مع ميزان مدمج وسخان وعاء',
    nameEn: 'Kenwood Titanium Chef Patissier XL 1400W Stand Mixer with Built-in Scale & Warming',
    brand: 'KENWOOD',
    price: 28400,
    originalPrice: 31000,
    sku: 'KNW-MXR-PAT-XL',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'شاشة لمس ملونة، وعاء ستانلس مزدوج 7 لتر و5 لتر، إضاءة داخل الوعاء، مع 4 أدوات عجن وخفق صلبة.',
    descriptionEn: 'Full touchscreen, dual 7L & 5L stainless bowls, bowl illumination, and heavy-duty planetary gear system.',
    specsAr: { 'القدرة': '1400 وات عزم عالي', 'السعة': '7 لتر ستانلس ستيل', 'المميزات': 'ميزان مدمج وتدفئة لتخمير العجين', 'الضمان': 'سنتين دولي ومحلي' },
    specsEn: { 'Power': '1400W Heavy Duty', 'Capacity': '7.0L Dual Bowls', 'Features': 'Built-in Scale & Proofing Heat', 'Warranty': '2 Years' }
  },
  {
    id: 'bride-p5',
    trousseauType: 'bride',
    category: 'towels',
    categoryAr: 'المناشف وأطقم البشاكير والبرانس',
    categoryEn: 'Bathrobe & Cotton Towel Sets',
    nameAr: 'طقم برنس وبشاكير تركي رويال قطن مصري 100% طويل التيلة 14 قطعة للعروسين',
    nameEn: 'Couples Luxury 14-Piece Bathrobe & Egyptian Combed Cotton Towel Set',
    brand: 'Maison D’Artisan',
    price: 4950,
    originalPrice: 5800,
    sku: 'MSN-BTH-14PC',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    descriptionAr: 'برنس رجالي وبرنس حريمي بكابيشون، 2 بشكير حمام كبير 100×150 سم، 4 مناشف وجه، 4 مناشف يد، و2 خف منزلي مطرز.',
    descriptionEn: 'Groom & Bride hooded robes, 2 oversized bath sheets, 4 face towels, 4 guest towels and matching embroidered slippers.',
    specsAr: { 'الخامة': 'قطن مصري 100% غزل 650 جرام/م²', 'الألوان': 'أبيض ناصع / رمادي ملكي مطعم بجولد', 'القطع': '14 قطعة متكاملة' },
    specsEn: { 'Material': '100% Long-Staple Egyptian Cotton 650 GSM', 'Colors': 'Crisp White / Royal Slate Gold', 'Pieces': '14 Pieces' }
  }
];

export const initialBridePackages: TrousseauPackage[] = [
  {
    id: 'pack-bride-gold',
    trousseauType: 'bride',
    nameAr: 'باقة العروسة الشاملة (جهاز المطبخ والمفروشات)',
    nameEn: 'Comprehensive Royal Bride Package',
    taglineAr: 'أفخم الحلل، أطقم الصيني، المفروشات التركية ومحضر الطعام بخصم 18%',
    taglineEn: 'Finest cookware, bone china, Turkish linens and stand mixer at 18% bundle discount',
    totalPrice: 69000,
    originalPrice: 84000,
    savings: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
    itemsCount: 7,
    itemsAr: [
      'طقم حلل جرانيت كوركماز تركي 11 قطعة',
      'طقم صيني فتحي محمود 124 قطعة مذهب بالكامل',
      'طقم معالق وشوك وأواني مائدة كروما 86 قطعة في شنطة جلدية',
      'مفرش سرير عروسة ستان كافيار مطرز 6 قطع',
      'طقم برنس وبشاكير العروسين 14 قطعة قطن 100%',
      'عجان ومحضر طعام كينوود تيتانيوم 1400 وات',
      'طقم ملايات ومفروشات يومية تركي 10 أطقم منوعة مجاناً'
    ],
    itemsEn: [
      'Korkmaz Turkish 11-Piece Titanium Granite Pot Set',
      'Fathi Mahmoud 124-Piece Gold-Rimmed Bone China',
      'Kroma 86-Piece Cutlery Set in Luxury Leather Briefcase',
      'Taç Turkish Caviar Satin Bridal Bedspread 6-Piece',
      'Couple’s 14-Piece Combed Egyptian Cotton Bathrobe Set',
      'Kenwood Chef Titanium Stand Mixer 1400W',
      'Complimentary 10 sets of Turkish everyday bed linens'
    ],
    popular: true
  }
];

// Section 4: Wedding Planner Services
export const initialWeddingServices: WeddingServiceItem[] = [
  {
    id: 'wed-v1',
    category: 'venue',
    nameAr: 'قاعة جراند تريانون — فندق رويال بالاس (التجمع الخامس)',
    nameEn: 'Grand Trianon Ballroom — Royal Palace Hotel (New Cairo)',
    locationAr: 'القاهرة الجديدة — التجمع الخامس',
    locationEn: 'New Cairo — 5th Settlement',
    startingPrice: 85000,
    pricingType: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewsCount: 142,
    capacity: '300 إلى 650 فرد',
    descriptionAr: 'قاعة فاخرة على الطراز الفرنسي الكلاسيكي مع نجف كريستال شواروفسكي، نظام صوت وإضاءة سينمائي متكامل، وجناح للعروسين شامل العشاء والإفطار.',
    descriptionEn: 'Opulent French neo-classical ballroom with Swarovski crystal chandeliers, concert-grade acoustic system and complimentary bridal suite.',
    featuresAr: ['شاشات ليد عملاقة 4K', 'خدمة صف سيارات VIP', 'بوفيه مفتوح فاخر 5 نجوم', 'مسرح وزفة استعراضية مضيئة', 'جناح فندقي للعروسين مجاناً'],
    featuresEn: ['Giant 4K LED backdrop screens', 'VIP Valet parking service', '5-star open buffet dining', 'Illuminated stage & grand runway', 'Complimentary bridal suite stay'],
    badge: 'الأعلى تقييماً'
  },
  {
    id: 'wed-v2',
    category: 'venue',
    nameAr: 'فيلا لؤلؤة النيل أوبن إير — طريق مصر إسكندرية الصحراوي',
    nameEn: 'Nile Pearl Open-Air Garden Villa — Cairo-Alex Desert Road',
    locationAr: 'الشيخ زايد — طريق إسكندرية الصحراوي',
    locationEn: 'Sheikh Zayed — Desert Road',
    startingPrice: 65000,
    pricingType: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8,
    reviewsCount: 98,
    capacity: '200 إلى 500 فرد',
    descriptionAr: 'أجواء أوروبية ساحرة في الهواء الطلق بين الأشجار المضيئة والبحيرات المائية، كوشة عصرية وممر زجاجي مضيء فوق الماء.',
    descriptionEn: 'Enchanting European open-air garden surrounded by fairy-lit foliage, water fountains and glass over-water runway.',
    featuresAr: ['ديكورات بوهو وخشبية رومانسية', 'إضاءات فيري لايتس ساحرة', 'منطقة كيدز إريا وألعاب أطفال', 'مولد كهرباء احتياطي طوارئ'],
    featuresEn: ['Romantic boho & floral setups', 'Fairy light canopy ceiling', 'Dedicated children entertainment area', 'Industrial backup power generators']
  },
  {
    id: 'wed-d1',
    category: 'dress',
    nameAr: 'فستان زفاف ملكي أوف وايت مطرز يدوياً كريستال وبيرل — كولكشن 2026',
    nameEn: 'Royal Hand-Embroidered Bridal Ballgown with Swarovski Crystals — 2026 Collection',
    locationAr: 'المهندسين — شارع سوريا',
    locationEn: 'Mohandessin — Souria St.',
    startingPrice: 12000,
    pricingType: 'fixed',
    imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80'],
    rating: 5.0,
    reviewsCount: 86,
    descriptionAr: 'تصميم هوت كوتور إسباني بقصة ملكية مع ذيل ملكي 3 أمتار قابل للفك، متاح للإيجار أول لبسة أو الشراء مع الطرحة والتاج مجاناً.',
    descriptionEn: 'Spanish haute couture ballgown with 3-meter detachable royal train, available for first-wear rental or purchase with veil and tiara.',
    featuresAr: ['متاح إيجار أول لبسة أو بيع', 'جلسة بروفات وتعديل مقاس مجانية', 'طرحة فرنسية مطرزة وتاج هدية', 'تنظيف وتعقيم بريميوم'],
    featuresEn: ['First-wear rental or purchase option', 'Free fitting & bespoke alterations', 'French embroidered veil & crown included', 'Dry-cleaning sanitized packaging']
  },
  {
    id: 'wed-c1',
    category: 'car',
    nameAr: 'مرسيدس مايباخ S-Class ليموزين مع سائق محترف وديكور الورد',
    nameEn: 'Mercedes-Maybach S-Class Chauffeur & Fresh Floral Decoration',
    locationAr: 'القاهرة والجيزة والإسكندرية',
    locationEn: 'Cairo, Giza & Alexandria',
    startingPrice: 6500,
    pricingType: 'fixed',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    reviewsCount: 114,
    descriptionAr: 'سيارة زفاف مرسيدس حديثة مع سائق بالزي الرسمي، تزيين كامل بأفخر الورود الطبيعية من اختيار العروسين، وخدمة 10 ساعات متواصلة.',
    descriptionEn: 'Flagship Mercedes-Maybach with suited chauffeur, bespoke fresh floral arrangement, and 10 hours uninterrupted service.',
    featuresAr: ['سائق ببدلة رسمية لبق ومحترف', 'تزيين ورد طبيعي حسب اللون المفضل', 'شامل البنزين والإكراميات', 'مشروبات ترحيبية داخل السيارة'],
    featuresEn: ['Uniformed bilingual executive driver', 'Custom fresh floral styling', 'Fuel & tolls fully inclusive', 'Chilled bridal refreshments in cabin']
  },
  {
    id: 'wed-p1',
    category: 'photography',
    nameAr: 'باقة التصوير السينمائي الكاملة — درونز + ألبوم ديجيتال وميني ألبوم',
    nameEn: 'Cinematic Full-Day Wedding Photography & 4K Drone Coverage',
    locationAr: 'جميع محافظات مصر',
    locationEn: 'All Egyptian Governorates',
    startingPrice: 9500,
    pricingType: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    reviewsCount: 175,
    descriptionAr: 'تغطية من بداية التحضير في البيوتي سنتر حتى آخر دقيقة في الفرح، مع مصورين فوتوغرافي وفيديو كاميرا سينما وطيار درونز.',
    descriptionEn: 'Full day coverage from beauty salon prep to final dance, featuring cinema cameras, 4K aerial drone, and digital albums.',
    featuresAr: ['ألبوم فوتوبوك إيطالي جلد فاخر 30×60 سم', 'فيديو كليب تريلر سينمائي 4K', 'جلسة فوتوسيشن بري ويدنج خارجية مجانية', 'تسليم كافة الصور الأصلية على فلاشة ميموري'],
    featuresEn: ['Italian leather photobook 30x60cm', '4K Cinematic wedding highlights film', 'Complimentary pre-wedding outdoor session', 'All raw & retouched photos delivered on USB']
  },
  {
    id: 'wed-b1',
    category: 'beauty',
    nameAr: 'بكج العروسة VIP مع خبيرة التجميل نوران علام (ميك آب + تصفيف شعر وحجاب)',
    nameEn: 'Bridal VIP Glam Package with Celebrity Artist Nouran Allam',
    locationAr: 'التجمع الخامس / مصر الجديدة / الشيخ زايد',
    locationEn: 'New Cairo / Heliopolis / Sheikh Zayed',
    startingPrice: 8000,
    pricingType: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    reviewsCount: 128,
    descriptionAr: 'أفخم مستحضرات التجميل العالمية المقاومة للدموع والحرارة (Dior, MAC, Charlotte Tilbury) مع رموش منك ولف حجاب أو تصفيف شعر.',
    descriptionEn: 'Ultra long-lasting waterproof luxury beauty application with Dior & Charlotte Tilbury, mink lashes, and couture veil styling.',
    featuresAr: ['ماسك ترطيب وعناية بالبشرة قبل الميك آب', 'مساعد خاص مرافق طوال الجلسة', 'ميك آب وصيفة العروسة أو والدة العروسة مجاناً'],
    featuresEn: ['Hydra-glow skin prep & collagen mask', 'Dedicated bridal beauty concierge', 'Complimentary bridesmaid / mother makeover']
  },
  {
    id: 'wed-dec1',
    category: 'decor',
    nameAr: 'تنسيق كوشة وممر زهور ملكي وإضاءات سنتر بيس — ديزاين 2026',
    nameEn: 'Royal Floral Kosha Stage, Runway Arches & Table Centerpieces',
    locationAr: 'القاهرة والجيزة',
    locationEn: 'Cairo & Giza',
    startingPrice: 22000,
    pricingType: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8,
    reviewsCount: 65,
    descriptionAr: 'كوشة عروسين عصرية هيدروليكية أو خشبية مع زهور هولندية طبيعية ومستوردة، بوابات استقبال فخمة، وسنتر بيس مضيء لجميع طاولات القاعة.',
    descriptionEn: 'Designer stage with Dutch imported fresh florals, illuminated entryway arches, and bespoke crystal table centerpieces.',
    featuresAr: ['زهور طبيعية بألوان متناسقة مع الفستان', 'ممر زجاجي مضيء LED للعروسين', 'تنسيق طاولات المعازيم بالكامل', 'رسم كروكي 3D مسبق للتصميم'],
    featuresEn: ['Fresh florals matched to bridal theme', 'Illuminated glass bridal walkway', 'Complete guest table coordination', 'Prior 3D mockup approval']
  },
  {
    id: 'wed-ent1',
    category: 'entertainment',
    nameAr: 'زفة شو استعراضية لبنانية ومصرية + دي جي محترف وفقرة فاير شو',
    nameEn: 'Grand Lebanese & Egyptian Zaffa Troupe + Pro DJ & Fireworks Show',
    locationAr: 'القاهرة، الجيزة، الإسكندرية',
    locationEn: 'Cairo, Giza, Alexandria',
    startingPrice: 14000,
    pricingType: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    reviewsCount: 190,
    descriptionAr: 'فرقة زفة احترافية 18 فرداً بالطبول والدفوف والمزامير والسيوف، مع عازف ساكسفون لاستقبال المعازيم، ودي جي مع أحدث سيستم صوت.',
    descriptionEn: '18-performer theatrical zaffa troupe with drums, brass instruments and swords, plus live welcoming saxophonist and club-grade sound setup.',
    featuresAr: ['استعراض زفة الملوك 30 دقيقة', 'فقرة فاير وركس سباركلز آمنة ومصرحة', 'عازف ساكسفون لاستقبال الضيوف', 'هندسة صوت وميكسر دي جي كامل'],
    featuresEn: ['30-min Royal Zaffa entrance show', 'Cold indoor certified safe sparkle fireworks', 'Live welcome saxophonist performance', 'Complete audio engineering & wireless mics']
  },
  {
    id: 'wed-cat1',
    category: 'catering',
    nameAr: 'بوفيه مفتوح VIP 5 نجوم مع تورتة زفاف ملكية 5 أدوار',
    nameEn: 'VIP 5-Star Open Buffet Catering & 5-Tier Couture Wedding Cake',
    locationAr: 'جميع القاعات والفنادق',
    locationEn: 'All venues & ballrooms',
    startingPrice: 280, // per person
    pricingType: 'per_person',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8,
    reviewsCount: 110,
    descriptionAr: 'أشهى المأكولات الشرقية والغربية: مشويات مشكلة، لحوم باردة، سي فود، محاشي، بوفيه حلويات شرقية وغربية وعصائر فريش طازجة.',
    descriptionEn: 'Five-star culinary showcase: mixed grills, prime beef, Mediterranean seafood, salads, artisanal pastries and fresh juices.',
    featuresAr: ['شيفات محترفون وطاقم سيرفيس فندقي بالزي الموحد', 'تورتة زفاف 5 أدوار بالنكهة المطلوبة', 'عصائر طبيعية ومشروبات ساخنة غير محدودة', 'أطباق فاخرة وأدوات مائدة استيل كريستال'],
    featuresEn: ['Uniformed hotel-trained chefs & waitstaff', 'Customized 5-tier royal cake', 'Free-flow fresh mocktails & hot beverages', 'Silver chafing dishes & crystal service']
  },
  {
    id: 'wed-pkg-all',
    category: 'package',
    nameAr: 'بكج فرحي الملكي الشامل (قاعة + فستان + سيارة + تصوير + زفة + ديكور)',
    nameEn: 'Farahi All-Inclusive Royal Wedding Bundle',
    locationAr: 'القاهرة الكبرى والإسكندرية',
    locationEn: 'Greater Cairo & Alexandria',
    startingPrice: 165000,
    pricingType: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    galleryUrls: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'],
    rating: 5.0,
    reviewsCount: 220,
    descriptionAr: 'وفر وقتك ومجهودك مع باقة ليلة العمر المتكاملة، ننسق لك كل التفاصيل مع أفضل مزودي الخدمات في مصر بخصم 25% من التكلفة المنفصلة.',
    descriptionEn: 'Save weeks of stress: A fully coordinated wedding experience bundling venue, gown, luxury car, cinema photo, zaffa and decor at 25% savings.',
    featuresAr: [
      'حجز قاعة جراند تريانون لـ 300 فرد شامل البوفيه',
      'فستان زفاف إيجار أول لبسة مع الطرحة والتاج',
      'سيارة مرسيدس حديثة بالورد والسائق',
      'فريق تصوير كامل (2 فوتوغرافير + كاميرا سينما + درونز + ألبوم)',
      'فرقة زفة شو استعراضية مع دي جي وفاير وركس',
      'كوشة وممر زجاجي وسنتر بيس متكامل',
      'منسق زفاف شخصي (Wedding Concierge) مرافق طوال الليلة'
    ],
    featuresEn: [
      'Grand Trianon ballroom booking for 300 guests with banquet',
      'First-wear couture bridal gown with veil & tiara',
      'Mercedes sedan with suited chauffeur & floral styling',
      'Full cinematic photo/video crew + drone + Italian album',
      'Theatrical zaffa show troupe + pro DJ + cold sparks',
      'Bespoke floral Kosha + lit runway + table centerpieces',
      'Dedicated personal wedding concierge on site all evening'
    ],
    badge: 'الباقة الأكثر توفيراً'
  }
];

// Sample Initial Inquiries, Bookings, Orders, Financing, Support cases
export const sampleFinishingInquiries: FinishingInquiry[] = [
  {
    id: 'fin-inq-101',
    userId: 'usr-1',
    customerName: 'كريم عبد العزيز شريف',
    phone: '01012345678',
    governorate: 'القاهرة',
    areaSqm: 145,
    roomsCount: 3,
    bathroomsCount: 2,
    finishingTier: 'luxury',
    budgetEGP: 750000,
    notes: 'الشقة طوب أحمر في كمبوند سراي، محتاجين نفتح المطبخ أمريكان ونعمل حمام ماستر بدريسنج روم.',
    status: 'under_review',
    createdAt: '2026-10-29T14:30:00Z',
    estimatedCostMin: 720000,
    estimatedCostMax: 780000
  },
  {
    id: 'fin-inq-102',
    userId: 'usr-2',
    customerName: 'سارة عبد الرحمن المنشاوي',
    phone: '01123456789',
    governorate: 'الجيزة',
    areaSqm: 190,
    roomsCount: 4,
    bathroomsCount: 3,
    finishingTier: 'ultra_luxury',
    budgetEGP: 1500000,
    notes: 'دوبلكس في الشيخ زايد، نرغب في رخام كرارا للأرضيات ونظام سمارت هوم كامل وتصميم 3D مسبق.',
    status: 'site_visit_scheduled',
    createdAt: '2026-10-31T11:15:00Z',
    estimatedCostMin: 1450000,
    estimatedCostMax: 1600000
  }
];

export const sampleWeddingBookings: WeddingBookingRequest[] = [
  {
    id: 'wed-req-201',
    userId: 'usr-1',
    serviceId: 'wed-v1',
    serviceName: 'قاعة جراند تريانون — فندق رويال بالاس',
    category: 'venue',
    customerName: 'كريم عبد العزيز شريف',
    phone: '01012345678',
    weddingDate: '2027-02-14',
    guestCount: 350,
    governorate: 'القاهرة',
    notes: 'نريد التأكد من توافر يوم عيد الحب أو الجمعة التي تليها، مع إضافة بوفيه سي فود.',
    status: 'pending_review',
    createdAt: '2026-10-30T16:00:00Z'
  },
  {
    id: 'wed-req-202',
    userId: 'usr-2',
    serviceId: 'wed-d1',
    serviceName: 'فستان زفاف ملكي أوف وايت مطرز يدوياً',
    category: 'dress',
    customerName: 'سارة عبد الرحمن المنشاوي',
    phone: '01123456789',
    weddingDate: '2027-01-20',
    governorate: 'القاهرة',
    notes: 'أرغب في حجز ميعاد بروفة الفستان وتجربة الطرحة مع الاستفسار عن مقاس 38/40.',
    status: 'contacted',
    createdAt: '2026-11-01T09:20:00Z'
  }
];

export const sampleOrders: Order[] = [
  {
    id: 'ord-301',
    userId: 'usr-1',
    customerName: 'كريم عبد العزيز شريف',
    phone: '01012345678',
    address: 'عمارة 14، شارع النزهة، مصر الجديدة',
    city: 'القاهرة',
    items: [
      { product: initialGroomProducts[0], quantity: 1 },
      { product: initialGroomProducts[1], quantity: 1 }
    ],
    subtotal: 66300,
    deliveryFee: 0,
    total: 66300,
    paymentMethod: 'installments_request',
    status: 'processing',
    createdAt: '2026-10-28T18:40:00Z'
  }
];

export const sampleFinancingApplications: FinancingApplication[] = [
  {
    id: 'fin-app-401',
    userId: 'usr-1',
    customerName: 'كريم عبد العزيز شريف',
    phone: '01012345678',
    nationalId: '29508140103456',
    monthlyIncome: 28000,
    employer: 'شركة اتصالات وتقنية معلومات',
    governorate: 'القاهرة',
    requestedAmount: 180000,
    tenureMonths: 24,
    preferredProvider: 'valU (ڤاليو)',
    associatedSection: 'finishing',
    status: 'under_review',
    createdAt: '2026-10-30T10:00:00Z'
  }
];

export const sampleSupportCases: SupportCase[] = [
  {
    id: 'case-501',
    userId: 'usr-2',
    applicantName: 'م. م. ع (حالة يتيم الأبوين)',
    nationalId: '2981105******',
    phone: '0115******',
    governorate: 'الفيوم',
    address: 'مركز إطسا — محافظة الفيوم',
    category: 'appliances_furniture',
    caseDescription: 'شاب يتيم الأب والأم، مقبل على الزواج ويعمل باليومية، تم تجهيز الشقة بالجهود الذاتية ومتبقي الأجهزة الأساسية (غسالة وثلاجة وبوتاجاز).',
    urgencyLevel: 'urgent',
    documentsSubmitted: ['بطاقة الرقم القومي', 'شهادة وفاة الوالدين', 'عقد إيجار موثق', 'بحث اجتماعي من الشؤون'],
    status: 'field_research',
    supportValueEstimated: 45000,
    createdAt: '2026-10-25T12:00:00Z',
    internalNotes: 'تمت الزيارة الميدانية المبدئية، الحالة مستحقة وذات أولوية قصوى.'
  }
];

