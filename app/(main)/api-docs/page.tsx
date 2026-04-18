'use client';

import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

/**
 * @description Renders the interactive Swagger UI page for API documentation.
 * This is a client-side component as it interacts with the DOM.
 */
const SwaggerPage = () => {
  return (
    <div className="bg-white min-h-screen p-4 rounded-xl shadow-sm border border-gray-100 mt-6 mx-4 mb-8">
      <div className="mb-6 px-4 py-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
        <h1 className="text-xl font-bold text-blue-800">API Technical Documentation</h1>
        <p className="text-gray-600 text-sm mt-1">
          Gunakan panel interaktif di bawah ini untuk menguji dan memahami endpoint REST API sistem Partner Team Onboarding.
        </p>
      </div>
      
      <div className="swagger-wrapper">
        <SwaggerUI 
          url="/api/docs" 
          docExpansion="list"
          defaultModelsExpandDepth={-1} // Collapse models by default for cleaner look
        />
      </div>

      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .info .title {
          font-size: 24px;
          color: #1e3a8a;
        }
        .swagger-ui .opblock.opblock-get { background: rgba(59, 130, 246, 0.05); border-color: #3b82f6; }
        .swagger-ui .opblock.opblock-post { background: rgba(16, 185, 129, 0.05); border-color: #10b981; }
        .swagger-ui .opblock.opblock-put { background: rgba(245, 158, 11, 0.05); border-color: #f59e0b; }
        .swagger-ui .opblock.opblock-delete { background: rgba(239, 68, 68, 0.05); border-color: #ef4444; }
      `}</style>
    </div>
  );
};

export default SwaggerPage;
