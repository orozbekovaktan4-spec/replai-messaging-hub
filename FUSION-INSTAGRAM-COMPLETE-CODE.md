# FUSION INSTAGRAM AUTOMATION - COMPLETE IMPLEMENTATION

This file contains the complete implementation code for the Fusion-style Instagram automation system.
Copy sections into admin-super.html and server-new.js as indicated.

## PART 1: CSS STYLES (Add to <head> section of admin-super.html)

```css
/* Instagram Automation Styles */
.instagram-config-panel {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;
}

.config-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
}

.connected-status {
    color: var(--success);
    font-size: 14px;
    margin: 8px 0 0 0;
}

.config-section {
    margin-bottom: 32px;
}

.config-section h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
}

.toggle-label {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-tertiary);
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.toggle-label:hover {
    background: var(--bg-hover);
}

.toggle-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.rule-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
}

.rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
}

.rule-header h5 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.rule-field {
    margin-bottom: 20px;
}

.rule-field label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 400;
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

.keyword-input-group {
    margin-bottom: 8px;
}

.keyword-input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
}

.keyword-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.keyword-tags .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--accent-primary);
    color: var(--bg-primary);
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
}

.keyword-tags .tag button {
    background: none;
    border: none;
    color: var(--bg-primary);
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.response-mode-select {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
}

.mode-template textarea,
.mode-append textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
    min-height: 100px;
    resize: vertical;
    font-family: inherit;
}

.btn-icon {
    background: none;
    border: none;
    color: var(--danger);
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background 0.2s;
}

.btn-icon:hover {
    background: var(--bg-hover);
}

.instruction-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.instruction-modal-content {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 32px;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.instruction-modal-content h2 {
    margin: 0 0 24px 0;
    font-size: 24px;
    color: var(--text-primary);
}

.instruction-section {
    margin-bottom: 24px;
    padding: 20px;
    background: var(--bg-tertiary);
    border-radius: 12px;
}

.instruction-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: var(--text-primary);
}

.instruction-section.warning {
    background: rgba(245, 158, 11, 0.1);
    border: 2px solid var(--warning);
}

.check-item {
    margin-bottom: 16px;
}

.check-item strong {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.check-item p {
    margin: 4px 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
}

.check-item em {
    font-size: 13px;
    color: var(--text-tertiary);
}

.instruction-section ol,
.instruction-section ul {
    margin: 12px 0 0 20px;
    color: var(--text-secondary);
}

.instruction-section li {
    margin-bottom: 8px;
    line-height: 1.6;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
}
```

## PART 2: INSTAGRAM CONFIGURATION PANEL HTML
(Replace the existing Instagram panel at line ~2000 in admin-super.html)

This continues in the next message due to length...
