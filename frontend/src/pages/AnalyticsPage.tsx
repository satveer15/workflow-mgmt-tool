import { useState, useEffect } from 'react';
import { useRole } from '../hooks';
import { analyticsService } from '../services/analyticsService';
import { Card, CardHeader, CardBody, LoadingSpinner } from '../components';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TaskStatistics, ProductivityMetrics, TeamAnalytics } from '../types';
import './AnalyticsPage.css';

const COLORS = {
  TODO: '#FCD34D',
  IN_PROGRESS: '#60A5FA',
  DONE: '#34D399',
  CANCELLED: '#F87171',
  LOW: '#34D399',
  MEDIUM: '#FCD34D',
  HIGH: '#F87171',
};

export const AnalyticsPage: React.FC = () => {
  const { canViewAnalytics } = useRole();
  const [taskStats, setTaskStats] = useState<TaskStatistics | null>(null);
  const [productivity, setProductivity] = useState<ProductivityMetrics | null>(null);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [canViewAnalytics]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch analytics data in parallel
      const promises: Promise<any>[] = [
        analyticsService.getProductivityMetrics(),
      ];

      if (canViewAnalytics) {
        promises.push(
          analyticsService.getTaskStatistics(),
          analyticsService.getTeamAnalytics()
        );
      }

      const results = await Promise.all(promises);

      setProductivity(results[0]);
      if (canViewAnalytics) {
        setTaskStats(results[1]);
        setTeamAnalytics(results[2]);
      }
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner center />;
  }

  if (error) {
    return (
      <div className="analytics-error">
        <Card>
          <CardBody>
            <h3>Error Loading Analytics</h3>
            <p>{error}</p>
            <button onClick={fetchAnalytics} className="retry-btn">
              Retry
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const statusChartData = taskStats
    ? Object.entries(taskStats.tasksByStatus).map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count,
        fill: COLORS[status as keyof typeof COLORS] || '#94A3B8',
      }))
    : [];

  const priorityChartData = taskStats
    ? Object.entries(taskStats.tasksByPriority).map(([priority, count]) => ({
        name: priority,
        value: count,
        fill: COLORS[priority as keyof typeof COLORS] || '#94A3B8',
      }))
    : [];

  const teamChartData = teamAnalytics
    ? Object.entries(teamAnalytics.tasksPerUser).map(([username, count]) => ({
        username,
        tasks: count,
        completionRate: Math.round((teamAnalytics.completionRatePerUser[username] || 0) * 100),
      }))
    : [];

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Insights and metrics for your workflow management
          </p>
        </div>
        <button onClick={fetchAnalytics} className="refresh-btn" disabled={isLoading}>
          🔄 Refresh
        </button>
      </div>

      {/* Personal Productivity Section */}
      <section className="analytics-section">
        <h2 className="section-title">My Productivity</h2>
        <div className="metrics-grid">
          <Card className="metric-card">
            <CardBody>
              <div className="metric-icon metric-icon-primary">📊</div>
              <div className="metric-content">
                <div className="metric-value">{productivity?.totalTasks || 0}</div>
                <div className="metric-label">Total Tasks</div>
              </div>
            </CardBody>
          </Card>

          <Card className="metric-card">
            <CardBody>
              <div className="metric-icon metric-icon-success">✅</div>
              <div className="metric-content">
                <div className="metric-value">{productivity?.completedTasks || 0}</div>
                <div className="metric-label">Completed</div>
              </div>
            </CardBody>
          </Card>

          <Card className="metric-card">
            <CardBody>
              <div className="metric-icon metric-icon-warning">⚡</div>
              <div className="metric-content">
                <div className="metric-value">{productivity?.inProgressTasks || 0}</div>
                <div className="metric-label">In Progress</div>
              </div>
            </CardBody>
          </Card>

          <Card className="metric-card">
            <CardBody>
              <div className="metric-icon metric-icon-info">📝</div>
              <div className="metric-content">
                <div className="metric-value">{productivity?.todoTasks || 0}</div>
                <div className="metric-label">To Do</div>
              </div>
            </CardBody>
          </Card>

          <Card className="metric-card metric-card-wide">
            <CardBody>
              <div className="metric-icon metric-icon-success">📈</div>
              <div className="metric-content">
                <div className="metric-value">
                  {productivity?.completionRate ? Math.round(productivity.completionRate * 100) : 0}%
                </div>
                <div className="metric-label">Completion Rate</div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Team Analytics Section (ADMIN/MANAGER only) */}
      {canViewAnalytics && taskStats && teamAnalytics && (
        <>
          {/* Task Distribution */}
          <section className="analytics-section">
            <h2 className="section-title">Task Distribution</h2>
            <div className="charts-grid">
              {/* Status Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <h3>Tasks by Status</h3>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) =>
                          `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* Priority Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <h3>Tasks by Priority</h3>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={priorityChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) =>
                          `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {priorityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
          </section>

          {/* Team Performance */}
          <section className="analytics-section">
            <h2 className="section-title">Team Performance</h2>
            <Card>
              <CardHeader>
                <h3>Tasks per Team Member</h3>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={teamChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="username" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#60A5FA" name="Total Tasks" />
                    <Bar dataKey="completionRate" fill="#34D399" name="Completion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </section>
        </>
      )}
    </div>
  );
};
