'use client'

import React from 'react'
import { Row, Col } from 'antd'

import { Footer as AntFooter } from 'antd/es/layout/layout'

export default function Footer() {
  return (
    <AntFooter className="footer border-top px-sm-2 py-2" style={{ padding: '12px 16px' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <span>
            <a className="text-decoration-none" href="https://coreui.io">CoreUI </a>
            <a className="text-decoration-none" href="https://coreui.io">
              Bootstrap Admin Template
            </a>
            &nbsp;© 2021 creativeLabs.
          </span>
        </Col>
        <Col>
          <span>
            Powered by&nbsp;
            <a
              className="text-decoration-none"
              href="@app/ui/dashboard/AdminLayout"
            >
              CoreUI UI Components
            </a>
          </span>
        </Col>
      </Row>
    </AntFooter>
  )
}
