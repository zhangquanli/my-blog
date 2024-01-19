import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <>
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <header className="global-header">{header}</header>
        <main>{children}</main>

      </div>
      {/*备案信息*/}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        margin: "16px",
        height: "16px",
        lineHeight: "16px"
      }}>
        <StaticImage src="../images/beian.png" alt="beian" height={16} />
        <a
          href="https://beian.mps.gov.cn/#/query/webSearch?code=50010702505471"
          target="_blank" rel="noreferrer">渝公网安备50010702505471</a>
        <a href="https://beian.miit.gov.cn/" target="_blank"
           rel="noreferrer">渝ICP备2024020305号-1</a>
      </div>
    </>
  )
}

export default Layout
