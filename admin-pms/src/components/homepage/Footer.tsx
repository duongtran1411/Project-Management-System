export default function Footer() {
  return (
    <footer className="bg-[#f8f8f8] text-sm text-black rounded-b-lg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <div className="mb-4">
              <img
                className="w-10 h-10 rounded-full"
                src="/jira_icon.png"
                alt="logo"
              />{" "}
              {/* Logo Placeholder */}
            </div>
            <ul className="space-y-2 font-[700] text-[14px] text-left">
              <li>Company</li>
              <li>Careers</li>
              <li>Events</li>
              <li>Blogs</li>
              <li>Investor Relations</li>
              <li>Atlassian Foundation</li>
              <li>Contact us</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-bold mb-4 ">PRODUCTS</h4>
            <ul className="space-y-2 text-[14px]  text-left">
              <li>Rovo</li>
              <li>Jira</li>
              <li>Jira Align</li>
              <li>Jira Service Management</li>
              <li>Confluence</li>
              <li>Loom</li>
              <li>Trello</li>
              <li>Bitbucket</li>
            </ul>
            <a
              href="#"
              className="text-blue-900 font-semibold mt-2 inline-block"
            >
              See all products →
            </a>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-bold mb-4">RESOURCES</h4>
            <ul className="space-y-2 text-[14px] text-left">
              <li>Technical support</li>
              <li>Purchasing & licensing</li>
              <li>Atlassian Community</li>
              <li>Knowledge base</li>
              <li>Marketplace</li>
              <li>My account</li>
            </ul>
            <a
              href="#"
              className="text-blue-900 font-semibold mt-2 inline-block"
            >
              Create support ticket →
            </a>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-bold mb-4">LEARN</h4>
            <ul className="space-y-2 text-[14px]  text-left">
              <li>Partners</li>
              <li>Training & certification</li>
              <li>Documentation</li>
              <li>Developer resources</li>
              <li>Enterprise services</li>
            </ul>
            <a
              href="#"
              className="text-blue-900 font-semibold mt-2 inline-block"
            >
              See all resources →
            </a>
          </div>
        </div>
      </div>

      {/* <div className="border-t border-gray-200 py-6 px-4 flex flex-col md:flex-row justify-between items-center text-gray-600">
        <p className="text-center md:text-left mb-2 md:mb-0">
          Copyright © 2025 Atlassian
        </p>
        <div className="flex items-center gap-6 text-sm">
          <a href="#">Privacy policy</a>
          <a href="#">Terms</a>
          <a href="#">Impressum</a>
          <div className="flex items-center gap-1">🌐 English ▼</div>
        </div>
      </div> */}
    </footer>
  );
}
