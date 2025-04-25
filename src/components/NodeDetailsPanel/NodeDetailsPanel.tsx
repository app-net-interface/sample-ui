import React from 'react';
import './NodeDetailsPanel.css';

interface NodeDetailsPanelProps {
  nodeData: any;
  onClose: () => void;
}

// formatSimpleValue remains the same - handles top-level URLs
const formatSimpleValue = (value: any): React.ReactNode => {
  if (value === null) {
    return <span className="null-value">null</span>;
  }
  if (typeof value === 'boolean') {
    return <span className={value ? 'bool-true' : 'bool-false'}>{String(value)}</span>;
  }
  // --- Handles URLs ---
  if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
    return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
  }
  if (typeof value === 'object' && value !== null) {
      return Array.isArray(value) ? '[Array]' : '[Object]';
  }
  return String(value);
};

// --- Helper to render potentially clickable string values ---
const renderStringValue = (value: any): React.ReactNode => {
    const strValue = String(value ?? ''); // Ensure it's a string
    if (strValue.startsWith('http://') || strValue.startsWith('https://')) {
        return <a href={strValue} target="_blank" rel="noopener noreferrer">{strValue}</a>;
    }
    return strValue; // Return the plain string if not a URL
};


const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ nodeData, onClose }) => {
  if (!nodeData || typeof nodeData !== 'object') {
    return null;
  }

  const topLevelEntries = Object.entries(nodeData);

  // --- Step 1: Identify top-level keys that are NOT the properties array ---
  const topLevelPrimitiveKeys = new Set<string>();
  topLevelEntries.forEach(([key, value]) => {
    if (!Array.isArray(value)) {
        topLevelPrimitiveKeys.add(key);
    }
  });


  return (
    <div className="node-details-panel">
      <div className="panel-header">
        <h4>Node Details</h4>
        <button onClick={onClose} className="close-button" aria-label="Close details">
          &times;
        </button>
      </div>
      <div className="panel-content">
        {topLevelEntries.length > 0 ? (
          <table className="details-table">
            <tbody>
              {topLevelEntries.map(([key, value]) => {
                // Case 1: Value is a plain object (Treat as primitive for now)
                // if (typeof value === 'object' && value !== null && !Array.isArray(value)) { ... }

                // Case 2: Value is an Array (like propertiesMap, assuming items are [key, value] pairs)
                if (Array.isArray(value)) {
                   const filteredArrayItems = value.filter(item => {
                       if (Array.isArray(item) && item.length >= 2) {
                           const itemKey = String(item[0] ?? '');
                           return !topLevelPrimitiveKeys.has(itemKey);
                       }
                       return false;
                   });

                   const hasRenderableItems = filteredArrayItems.length > 0;

                   if (value.length > 0) {
                     return (
                      <tr key={key} className="collapsible-row">
                        <td colSpan={2}>
                          <details className="details-block">
                            <summary className="summary-key">
                               properties
                               {/* --- Removed the placeholder span --- */}
                            </summary>
                            <div className="nested-array-content">
                               <table className="nested-keyvalue-table">
                                 <tbody>
                                  {filteredArrayItems.map((item, index) => {
                                    const itemKey = item[0];
                                    const itemValue = item[1];
                                    return (
                                      <tr key={index}>
                                        <td className="nested-detail-key">{String(itemKey ?? '')}</td>
                                        {/* --- Use renderStringValue for nested values --- */}
                                        <td className="nested-detail-value">{renderStringValue(itemValue)}</td>
                                      </tr>
                                    );
                                  })}
                                 </tbody>
                               </table>
                              {!hasRenderableItems && value.length > 0 && <div className="nested-empty">(All properties already shown at top level)</div>}
                              {value.length === 0 && <div className="nested-empty">(Array is empty)</div>}
                            </div>
                          </details>
                        </td>
                      </tr>
                     );
                   } else {
                      return null;
                   }
                }
                // Case 3: Value is primitive, null, or an object we're not expanding
                else {
                  return (
                    <tr key={key}>
                      <td className="detail-key">{key}</td>
                      {/* formatSimpleValue handles top-level URLs */}
                      <td className="detail-value">{formatSimpleValue(value)}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        ) : (
          <p className="no-details-message">No details to display.</p>
        )}
      </div>
    </div>
  );
};

export default NodeDetailsPanel;