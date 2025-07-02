import Link from 'next/link'
import HeaderFeaturedNav from './HeaderFeaturedNav'
import HeaderNotificationNav from './HeaderNotificationNav'
import HeaderProfileNav from './HeaderProfileNav'
import HeaderSidebarToggler from './HeaderSidebarToggler'
import BreadcrumbAnt from '../Breadcrumb/Breadcrumb'

export default function Header() {
  return (
    <header className="header sticky-top mb-4 py-2 px-sm-2 border-bottom">
      <div className="header-navbar d-flex align-items-center px-0">
        <HeaderSidebarToggler />
        <Link href="/" className="header-brand d-md-none">
          <svg width="80" height="46">
            <title>CoreUI Logo</title>
            <use xlinkHref="/assets/brand/coreui.svg#full" />
          </svg>
        </Link>
        <div className="header-nav d-none d-md-flex">
          <HeaderFeaturedNav />
        </div>
        <div className="header-nav ms-auto">
          {/* <HeaderNotificationNav /> */}
        </div>
        <div className="header-nav ms-2">
          <HeaderProfileNav />
        </div>
      </div>
      <div className="header-divider border-top my-2 mx-sm-n2" />
        <BreadcrumbAnt />
    </header>
  )
}
