import { Row, type RowProps } from 'antd';

interface PropsRowCustom extends RowProps {}

const RowCustom: React.FC<PropsRowCustom> = ({ ...props }) => {
  return <Row wrap={true} gutter={[16, 16]} {...props}></Row>;
};
export default RowCustom;
