import { CSSObject } from '@ant-design/cssinjs';

type StyleFunction = (args: {
  css: (style: CSSObject) => string;
  token: Record<string, any>;
}) => Record<string, string>;

export const createStyles = (fn: StyleFunction) => {
  const css = (style: CSSObject) => {
    // Giả lập chuyển style object thành chuỗi class name (mock)
    return JSON.stringify(style);
  };

  const token = {
    antCls: '.ant',
    // Có thể thêm các token khác nếu cần
  };

  return fn({ css, token });
};