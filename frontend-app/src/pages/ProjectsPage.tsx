import { Card, Typography, Empty } from 'antd';
import { FolderOutlined } from '@ant-design/icons';

const { Title } = Typography;

function ProjectsPage() {
  return (
    <div>
      <Title level={2}>Projects</Title>
      <Card>
        <Empty
          image={<FolderOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description="No projects available"
        />
      </Card>
    </div>
  );
};

export default ProjectsPage;
