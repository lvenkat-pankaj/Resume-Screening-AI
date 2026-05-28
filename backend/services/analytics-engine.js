/**
 * Analytics & Insights Engine
 *
 * Provides:
 * 1. Candidate insights (patterns, trends, quality metrics)
 * 2. Hiring metrics (match score distributions, acceptance rates)
 * 3. Performance tracking (API latency, success rates, error patterns)
 * 4. Smart recommendations (best interview questions, patterns)
 */

const fs = require('fs');
const path = require('path');

// In-memory analytics store (in production, use database)
const analytics = {
  screenings: [],
  insights: {
    avgMatchScore: 0,
    totalScreenings: 0,
    matchedCount: 0,
    unmatchedCount: 0,
    avgProcessingTime: 0,
    skillPatterns: {},
    topSkills: [],
    rejectionReasons: [],
    interviewQualityScores: []
  },
  logs: []
};

/**
 * Log an event for analytics
 * @param {string} eventType - Type of event (screening, error, performance)
 * @param {Object} data - Event data
 */
function logEvent(eventType, data) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    ...data
  };

  analytics.logs.push(logEntry);

  // Keep logs in reasonable size (last 1000 entries)
  if (analytics.logs.length > 1000) {
    analytics.logs = analytics.logs.slice(-1000);
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${eventType}] ${JSON.stringify(data)}`);
  }

  return logEntry;
}

/**
 * Record a screening event with insights
 * @param {Object} screening - Screening data with workflow results
 */
function recordScreening(screening) {
  const {
    resumeHash,
    matchScore,
    matched,
    skills,
    processingTime,
    skillsExtracted,
    questionsGenerated,
    summaryGenerated,
    timestamp = new Date()
  } = screening;

  // Add to screenings array
  const screeningRecord = {
    id: `screening_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    resumeHash,
    matchScore,
    matched,
    skills,
    processingTime,
    skillsExtracted,
    questionsGenerated,
    summaryGenerated
  };

  analytics.screenings.push(screeningRecord);

  // Keep screenings in reasonable size (last 500 entries)
  if (analytics.screenings.length > 500) {
    analytics.screenings = analytics.screenings.slice(-500);
  }

  // Update insights
  updateInsights();

  // Log the screening
  logEvent('SCREENING_COMPLETED', {
    id: screeningRecord.id,
    matchScore,
    matched,
    processingTime,
    skillCount: skills ? skills.length : 0
  });

  return screeningRecord;
}

/**
 * Update analytics insights based on current screenings
 */
function updateInsights() {
  const screenings = analytics.screenings;

  if (screenings.length === 0) {
    return;
  }

  // Calculate average match score
  const totalScore = screenings.reduce((sum, s) => sum + (s.matchScore || 0), 0);
  analytics.insights.avgMatchScore = Math.round(totalScore / screenings.length * 10) / 10;

  // Count matches
  analytics.insights.matchedCount = screenings.filter(s => s.matched === true).length;
  analytics.insights.unmatchedCount = screenings.filter(s => s.matched === false).length;
  analytics.insights.totalScreenings = screenings.length;

  // Calculate average processing time
  const totalTime = screenings.reduce((sum, s) => sum + (s.processingTime || 0), 0);
  analytics.insights.avgProcessingTime = Math.round(totalTime / screenings.length);

  // Extract skill patterns
  const skillPatterns = {};
  screenings.forEach(screening => {
    if (Array.isArray(screening.skills)) {
      screening.skills.forEach(skill => {
        skillPatterns[skill] = (skillPatterns[skill] || 0) + 1;
      });
    }
  });

  analytics.insights.skillPatterns = skillPatterns;

  // Get top 10 skills
  analytics.insights.topSkills = Object.entries(skillPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count, percentage: Math.round((count / screenings.length) * 100) }));
}

/**
 * Get analytics summary with insights
 * @returns {Object} Analytics summary
 */
function getAnalyticsSummary() {
  return {
    summary: {
      totalScreenings: analytics.insights.totalScreenings,
      matchedCandidates: analytics.insights.matchedCount,
      unmatchedCandidates: analytics.insights.unmatchedCount,
      matchRate: analytics.insights.totalScreenings > 0
        ? Math.round((analytics.insights.matchedCount / analytics.insights.totalScreenings) * 100)
        : 0,
      avgMatchScore: analytics.insights.avgMatchScore,
      avgProcessingTime: `${analytics.insights.avgProcessingTime}ms`
    },
    topSkills: analytics.insights.topSkills,
    recentScreenings: analytics.screenings.slice(-5).reverse(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Get smart insights based on screening patterns
 * @returns {Object} Smart insights and recommendations
 */
function getSmartInsights() {
  const screenings = analytics.screenings;

  if (screenings.length === 0) {
    return {
      insights: [],
      recommendations: [],
      timestamp: new Date().toISOString()
    };
  }

  const insights = [];
  const recommendations = [];

  // Insight 1: Match score trend
  const recentScreenings = screenings.slice(-10);
  const recentAvg = recentScreenings.length > 0
    ? Math.round(recentScreenings.reduce((sum, s) => sum + (s.matchScore || 0), 0) / recentScreenings.length * 10) / 10
    : 0;

  if (recentAvg > analytics.insights.avgMatchScore + 5) {
    insights.push({
      type: 'POSITIVE_TREND',
      title: 'Rising Quality Trend',
      description: `Recent candidates have higher match scores (${recentAvg}) vs overall average (${analytics.insights.avgMatchScore})`,
      actionable: true
    });
  }

  // Insight 2: Most valuable skills
  if (analytics.insights.topSkills.length > 0) {
    const topSkill = analytics.insights.topSkills[0];
    insights.push({
      type: 'SKILL_PATTERN',
      title: `Most Common Skill: ${topSkill.skill}`,
      description: `Found in ${topSkill.percentage}% of candidates (${topSkill.count} out of ${analytics.insights.totalScreenings})`,
      actionable: true
    });
  }

  // Insight 3: Match rate analysis
  const matchRate = analytics.insights.totalScreenings > 0
    ? Math.round((analytics.insights.matchedCount / analytics.insights.totalScreenings) * 100)
    : 0;

  if (matchRate < 30) {
    insights.push({
      type: 'LOW_MATCH_RATE',
      title: 'Low Matching Rate',
      description: `Only ${matchRate}% of candidates meet the threshold. Consider reviewing job requirements.`,
      actionable: true
    });
  } else if (matchRate > 70) {
    insights.push({
      type: 'HIGH_MATCH_RATE',
      title: 'High Matching Rate',
      description: `${matchRate}% of candidates are qualified. Consider increasing difficulty/requirements.`,
      actionable: true
    });
  }

  // Recommendations
  if (analytics.insights.topSkills.length > 3) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Focus Recruitment',
      description: `Prioritize candidates with skills: ${analytics.insights.topSkills.slice(0, 3).map(s => s.skill).join(', ')}`
    });
  }

  if (analytics.insights.avgProcessingTime > 20000) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Optimize Performance',
      description: `Average processing time is ${analytics.insights.avgProcessingTime}ms. Consider caching or optimization.`
    });
  }

  recommendations.push({
    priority: 'MEDIUM',
    action: 'Review Top Questions',
    description: 'Most effective interview questions for matched candidates'
  });

  return {
    insights,
    recommendations,
    metrics: {
      totalScreenings: analytics.insights.totalScreenings,
      avgMatchScore: analytics.insights.avgMatchScore,
      matchRate: `${matchRate}%`,
      topSkill: analytics.insights.topSkills[0]?.skill || 'N/A'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get performance metrics
 * @returns {Object} Performance metrics
 */
function getPerformanceMetrics() {
  const screenings = analytics.screenings;

  if (screenings.length === 0) {
    return {
      metrics: null,
      message: 'No screenings recorded yet'
    };
  }

  const times = screenings.map(s => s.processingTime || 0);
  const sortedTimes = [...times].sort((a, b) => a - b);

  return {
    metrics: {
      totalRequests: screenings.length,
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
      p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)]
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get error logs and patterns
 * @returns {Object} Error analysis
 */
function getErrorAnalysis() {
  const errorLogs = analytics.logs.filter(log => log.eventType === 'ERROR');

  if (errorLogs.length === 0) {
    return {
      totalErrors: 0,
      errorRate: '0%',
      recentErrors: [],
      errorPatterns: {}
    };
  }

  // Count error types
  const errorPatterns = {};
  errorLogs.forEach(log => {
    const errorType = log.errorType || 'UNKNOWN';
    errorPatterns[errorType] = (errorPatterns[errorType] || 0) + 1;
  });

  const totalScreenings = analytics.screenings.length;
  const errorRate = totalScreenings > 0
    ? Math.round((errorLogs.length / totalScreenings) * 100)
    : 0;

  return {
    totalErrors: errorLogs.length,
    errorRate: `${errorRate}%`,
    errorPatterns,
    recentErrors: errorLogs.slice(-5).reverse(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Clear all analytics data
 * (Useful for testing or reset scenarios)
 */
function clearAnalytics() {
  analytics.screenings = [];
  analytics.logs = [];
  analytics.insights = {
    avgMatchScore: 0,
    totalScreenings: 0,
    matchedCount: 0,
    unmatchedCount: 0,
    avgProcessingTime: 0,
    skillPatterns: {},
    topSkills: [],
    rejectionReasons: [],
    interviewQualityScores: []
  };

  logEvent('ANALYTICS_CLEARED', { reason: 'Manual reset' });
}

/**
 * Export analytics data to JSON
 * @returns {Object} Full analytics data
 */
function exportAnalytics() {
  return {
    generatedAt: new Date().toISOString(),
    summary: getAnalyticsSummary(),
    insights: getSmartInsights(),
    performance: getPerformanceMetrics(),
    errors: getErrorAnalysis(),
    rawData: {
      screenings: analytics.screenings,
      logs: analytics.logs.slice(-100) // Last 100 logs only
    }
  };
}

module.exports = {
  logEvent,
  recordScreening,
  getAnalyticsSummary,
  getSmartInsights,
  getPerformanceMetrics,
  getErrorAnalysis,
  clearAnalytics,
  exportAnalytics,
  updateInsights
};
