
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  password: 'password',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StoreConfigScalarFieldEnum = {
  id: 'id',
  storeName: 'storeName',
  description: 'description',
  bannerUrl: 'bannerUrl',
  logoUrl: 'logoUrl',
  faviconUrl: 'faviconUrl',
  cnpj: 'cnpj',
  legalName: 'legalName',
  themeColor: 'themeColor',
  accentColor: 'accentColor',
  priceColor: 'priceColor',
  secondaryColor: 'secondaryColor',
  backgroundColor: 'backgroundColor',
  menuColor: 'menuColor',
  menuFont: 'menuFont',
  menuFontSize: 'menuFontSize',
  headerColor: 'headerColor',
  cartCountBg: 'cartCountBg',
  cartCountText: 'cartCountText',
  searchBtnBg: 'searchBtnBg',
  searchIconColor: 'searchIconColor',
  headerShowLogo: 'headerShowLogo',
  headerLogoWidth: 'headerLogoWidth',
  headerText: 'headerText',
  headerSubtext: 'headerSubtext',
  headerSearchPlaceholder: 'headerSearchPlaceholder',
  headingColor: 'headingColor',
  sectionTitleColor: 'sectionTitleColor',
  headingFont: 'headingFont',
  headingFontSize: 'headingFontSize',
  headerBtnBg: 'headerBtnBg',
  headerBtnText: 'headerBtnText',
  productBtnBg: 'productBtnBg',
  productBtnText: 'productBtnText',
  bodyColor: 'bodyColor',
  bodyFont: 'bodyFont',
  bodyFontSize: 'bodyFontSize',
  instagram: 'instagram',
  instagramToken: 'instagramToken',
  facebook: 'facebook',
  youtube: 'youtube',
  tiktok: 'tiktok',
  twitter: 'twitter',
  pinterest: 'pinterest',
  pinterestTag: 'pinterestTag',
  facebookPixelId: 'facebookPixelId',
  googleTagId: 'googleTagId',
  whatsapp: 'whatsapp',
  phone: 'phone',
  email: 'email',
  address: 'address',
  mapUrl: 'mapUrl',
  footerBg: 'footerBg',
  footerText: 'footerText',
  footerLogo: 'footerLogo',
  newsletterEnabled: 'newsletterEnabled',
  showPaymentMethods: 'showPaymentMethods',
  showSocialIcons: 'showSocialIcons',
  categoryDefaultImage: 'categoryDefaultImage',
  mobileColumns: 'mobileColumns',
  desktopColumns: 'desktopColumns',
  paginationType: 'paginationType',
  showInstallments: 'showInstallments',
  enableQuickBuy: 'enableQuickBuy',
  showColorVariations: 'showColorVariations',
  showHoverImage: 'showHoverImage',
  showCardCarousel: 'showCardCarousel',
  showLowStockWarning: 'showLowStockWarning',
  showProductSold: 'showProductSold',
  showPromoPrice: 'showPromoPrice',
  showDiscountPayment: 'showDiscountPayment',
  showInstallmentsDetail: 'showInstallmentsDetail',
  showVariations: 'showVariations',
  showMeasurements: 'showMeasurements',
  showSKU: 'showSKU',
  showStockQuantity: 'showStockQuantity',
  showShippingSimulator: 'showShippingSimulator',
  showBuyInfo: 'showBuyInfo',
  showRelatedProducts: 'showRelatedProducts',
  minPurchaseValue: 'minPurchaseValue',
  enableQuickCart: 'enableQuickCart',
  cartAction: 'cartAction',
  showCartRecommendations: 'showCartRecommendations',
  showShippingCalculator: 'showShippingCalculator',
  homeLayout: 'homeLayout',
  maintenanceMode: 'maintenanceMode',
  maintenanceMessage: 'maintenanceMessage',
  maintenancePassword: 'maintenancePassword',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentConfigScalarFieldEnum = {
  id: 'id',
  pagarmeEnabled: 'pagarmeEnabled',
  pagarmeApiKey: 'pagarmeApiKey',
  pagarmeEncryptionKey: 'pagarmeEncryptionKey',
  asaasEnabled: 'asaasEnabled',
  asaasApiKey: 'asaasApiKey',
  asaasWalletId: 'asaasWalletId',
  manualPixEnabled: 'manualPixEnabled',
  pixKey: 'pixKey',
  pixHolder: 'pixHolder',
  pixBank: 'pixBank',
  maxInstallments: 'maxInstallments',
  minInstallmentValue: 'minInstallmentValue',
  interestRate: 'interestRate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  url: 'url',
  filename: 'filename',
  mimeType: 'mimeType',
  size: 'size',
  width: 'width',
  height: 'height',
  copyright: 'copyright',
  altText: 'altText',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BannerScalarFieldEnum = {
  id: 'id',
  label: 'label',
  imageUrl: 'imageUrl',
  mobileUrl: 'mobileUrl',
  link: 'link',
  active: 'active',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  slug: 'slug',
  status: 'status',
  price: 'price',
  compareAtPrice: 'compareAtPrice',
  costPerItem: 'costPerItem',
  sku: 'sku',
  barcode: 'barcode',
  trackQuantity: 'trackQuantity',
  stock: 'stock',
  weight: 'weight',
  length: 'length',
  width: 'width',
  height: 'height',
  expiresAt: 'expiresAt',
  brandId: 'brandId',
  brandLegacy: 'brandLegacy',
  tags: 'tags',
  videoUrl: 'videoUrl',
  seoTitle: 'seoTitle',
  seoDescription: 'seoDescription',
  isNewArrival: 'isNewArrival',
  isFeatured: 'isFeatured',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductVariantScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  name: 'name',
  price: 'price',
  stock: 'stock',
  sku: 'sku',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductImageScalarFieldEnum = {
  id: 'id',
  url: 'url',
  alt: 'alt',
  productId: 'productId'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  imageUrl: 'imageUrl',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BrandScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  phone: 'phone',
  document: 'document',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  sessionId: 'sessionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  productId: 'productId',
  quantity: 'quantity',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  street: 'street',
  number: 'number',
  complement: 'complement',
  district: 'district',
  city: 'city',
  state: 'state',
  zipCode: 'zipCode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  code: 'code',
  customerId: 'customerId',
  customerName: 'customerName',
  customerEmail: 'customerEmail',
  customerPhone: 'customerPhone',
  status: 'status',
  total: 'total',
  subtotal: 'subtotal',
  shippingCost: 'shippingCost',
  discount: 'discount',
  paymentMethod: 'paymentMethod',
  paymentStatus: 'paymentStatus',
  shippingTitle: 'shippingTitle',
  shippingDays: 'shippingDays',
  addressStreet: 'addressStreet',
  addressNumber: 'addressNumber',
  addressComplement: 'addressComplement',
  addressDistrict: 'addressDistrict',
  addressCity: 'addressCity',
  addressState: 'addressState',
  addressZip: 'addressZip',
  origin: 'origin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  name: 'name',
  image: 'image',
  price: 'price',
  quantity: 'quantity'
};

exports.Prisma.PageScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  content: 'content',
  layout: 'layout',
  published: 'published',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MenuScalarFieldEnum = {
  id: 'id',
  title: 'title',
  handle: 'handle',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MenuItemScalarFieldEnum = {
  id: 'id',
  menuId: 'menuId',
  label: 'label',
  url: 'url',
  type: 'type',
  referenceId: 'referenceId',
  order: 'order'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  StoreConfig: 'StoreConfig',
  PaymentConfig: 'PaymentConfig',
  Media: 'Media',
  Banner: 'Banner',
  Product: 'Product',
  ProductVariant: 'ProductVariant',
  ProductImage: 'ProductImage',
  Category: 'Category',
  Brand: 'Brand',
  Customer: 'Customer',
  Cart: 'Cart',
  CartItem: 'CartItem',
  Address: 'Address',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Page: 'Page',
  Menu: 'Menu',
  MenuItem: 'MenuItem'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
