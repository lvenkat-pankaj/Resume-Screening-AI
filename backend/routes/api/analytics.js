/**
 * Analytics API Routes
 *
 * Provides insights and metrics about resume screening patterns
 * Includes candidate insights, performance metrics, and smart recommendations
 */

const express = require('express');
const router = express.Router();
const analytics = require('../../services/analytics-engine');

/**
 * GET /api/analytics/summary
 * Get overall analytics summary
 */
router.get('/summary', (req, res) => {
  try {
    const summary = analytics.getAnalyticsSummary();
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics summary'
    });
  }
});

/**
 * GET /api/analytics/insights
 * Get smart insights and recommendations
 */
router.get('/insights', (req, res) => {
  try {
    const insights = analytics.getSmartInsights();
    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve insights'
    });
  }
});

/**
 * GET /api/analytics/performance
 * Get performance metrics (latency, p95, p99, etc)
 */
router.get('/performance', (req, res) => {
  try {
    const metrics = analytics.getPerformanceMetrics();
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics'
    });
  }
});

/**
 * GET /api/analytics/errors
 * Get error analysis and patterns
 */
router.get('/errors', (req, res) => {
  try {
    const errorAnalysis = analytics.getErrorAnalysis();
    return res.status(200).json({
      success: true,
      data: errorAnalysis
    });
  } catch (error) {
    console.error('Error getting error analysis:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve error analysis'
    });
  }
});

/**
 * GET /api/analytics/export
 * Export all analytics data as JSON
 */
router.get('/export', (req, res) => {
  try {
    const allData = analytics.exportAnalytics();
    return res.status(200).json({
      success: true,
      data: allData
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export analytics'
    });
  }
});

/**
 * GET /api/analytics/dashboard
 * Comprehensive dashboard combining all metrics
 */
router.get('/dashboard', (req, res) => {
  try {
    const summary = analytics.getAnalyticsSummary();
    const insights = analytics.getSmartInsights();
    const performance = analytics.getPerformanceMetrics();
    const errors = analytics.getErrorAnalysis();

    return res.status(200).json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        summary: summary.summary,
        topSkills: summary.topSkills,
        insights: insights.insights,
        recommendations: insights.recommendations,
        performance: performance.metrics,
        errorRate: errors.errorRate,
        recentScreenings: summary.recentScreenings
      }
    });
  } catch (error) {
    console.error('Error getting dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

/**
 * DELETE /api/analytics/reset
 * Clear all analytics data (development only)
 */
router.delete('/reset', (req, res) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Analytics reset not allowed in production'
    });
  }

  try {
    analytics.clearAnalytics();
    return res.status(200).json({
      success: true,
      message: 'Analytics data cleared'
    });
  } catch (error) {
    console.error('Error clearing analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear analytics'
    });
  }
});

module.exports = router;
