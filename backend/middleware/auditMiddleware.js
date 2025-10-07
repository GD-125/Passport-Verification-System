// ==========================================
// FILE: backend/middleware/auditMiddleware.js
// ==========================================
const pool = require('../config/database');

const auditLog = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    res.send = originalSend;
    
    if (req.user) {
      const logEntry = {
        user_id: req.user.id,
        action: req.method,
        table_name: req.baseUrl.split('/').pop(),
        record_id: req.params.id || null,
        changes: JSON.stringify(req.body),
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      };

      pool.query(
        `INSERT INTO audit_logs 
         (user_id, action, table_name, record_id, changes, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        Object.values(logEntry)
      ).catch(err => console.error('Audit log error:', err));
    }

    return res.send(data);
  };

  next();
};

module.exports = auditLog;