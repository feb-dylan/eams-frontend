import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

/**
 * App-wide toasts and confirm dialogs (replaces window.alert / window.confirm).
 *
 *   const toast = useToast();     toast.success("Saved"); toast.error("Failed");
 *   const confirm = useConfirm(); if (!(await confirm("Delete this asset?"))) return;
 */
const FeedbackContext = createContext(null);

let nextId = 1;

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (variant, message) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-3), { id, variant, message }]);
      setTimeout(() => dismiss(id), variant === "danger" ? 7000 : 4000);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m) => show("success", m),
      error: (m) => show("danger", m),
      info: (m) => show("primary", m),
    }),
    [show]
  );

  const confirm = useCallback((options) => {
    const opts = typeof options === "string" ? { message: options } : options;
    setDialog({
      title: opts.title || "Please confirm",
      message: opts.message,
      confirmText: opts.confirmText || "Confirm",
      variant: opts.variant || "primary",
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result) => {
    setDialog(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* Toasts */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show align-items-center text-bg-${t.variant} border-0 mb-2`} role="status">
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto"
                      aria-label="Close" onClick={() => dismiss(t.id)}></button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {dialog && (
        <>
          <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="confirm-title"
               onKeyDown={(e) => e.key === "Escape" && close(false)}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="confirm-title">{dialog.title}</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => close(false)}></button>
                </div>
                <div className="modal-body">{dialog.message}</div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => close(false)}>
                    Cancel
                  </button>
                  <button type="button" className={`btn btn-${dialog.variant}`} autoFocus onClick={() => close(true)}>
                    {dialog.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </FeedbackContext.Provider>
  );
};

export const useToast = () => useContext(FeedbackContext).toast;
export const useConfirm = () => useContext(FeedbackContext).confirm;
