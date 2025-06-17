import { Breadcrumb } from 'antd'

export default async function BreadcrumbAnt() {

  return (
    <Breadcrumb
      className="mb-0 align-items-center"
      items={[
        {
          title: <a className="text-decoration-none" href="/">a</a>,
        },
        {
          title: <a className="text-decoration-none" href="/">b</a>,
        },
      ]}
    />
  )
}
