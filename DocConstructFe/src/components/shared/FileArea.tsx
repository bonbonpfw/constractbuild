import React, { useState } from "react";
import styled from "styled-components";
import {
  FaTrash,
  FaUpload,
  FaDownload,
  FaEye,
  FaEnvelope,
  FaPlus,
  FaFileAlt,
  FaPen,
  FaHistory,
} from "react-icons/fa";
import {
  DialogOverlay,
  DialogContainer,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  DialogActions,
  Button,
} from "../../styles/SharedStyles";
import { toast } from "react-toastify";
import { DocumentState } from "../../types";

export interface FileAreaDocument {
  fileName: string | null;
  fileType: string;
  fileId?: string;
  state: DocumentState;
  status?: string;
  created_at?: string;
  versions?: FileAreaDocumentVersion[];
}

export interface FileAreaDocumentVersion {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

// Create a styled component with the animation
const LoadingSpinner = styled.div`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  width: 12px;
  height: 12px;
  border: 2px solid #0071e3;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const WhiteLoadingSpinner = styled(LoadingSpinner)`
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top-color: transparent;
`;

// Container for the entire file area - redesigned with Apple-style aesthetics
const FileAreaContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 12px;
  min-height: 0;
  overflow: auto;
`;

// Main file area with tabs
const FileAreaContent = styled.div`
  display: flex;
  flex-direction: column;
`;

// Container for the file list - modified to remove scrolling
const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
  overflow: auto;

  /* Group files by type with separators */
  & > div:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const BatchActions = styled.div`
  display: flex;
  gap: 8px;
`;

// Individual file item with Apple design influence
const FileItemContainer = styled.div<{
  disabled: boolean;
  state: DocumentState;
  status?: string;
  hasVersions?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;

  background-color: ${(p) =>
    p.status === "Signed"
      ? "#e3f6ec"
      : p.status === "Filled"
      ? "#fff7e0"
      : p.state === DocumentState.MISSING
      ? "#fff8f8"
      : p.disabled
      ? "#f9f9f9"
      : "#ffffff"};
  border: 1px solid
    ${(p) =>
      p.status === "Signed"
        ? "#c5e8d5"
        : p.status === "Filled"
        ? "#ffe7b3"
        : p.state === DocumentState.MISSING
        ? "#ffdddd"
        : "#f0f0f0"};
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: ${(p) => (p.hasVersions ? "pointer" : "default")};

  &:hover {
    background-color: ${(p) =>
      p.status === "Signed"
        ? "#d5f0e2"
        : p.status === "Filled"
        ? "#fff0d0"
        : p.state === DocumentState.MISSING
        ? "#fff5f5"
        : p.disabled
        ? "#f9f9f9"
        : "#f9f9f9"};
    transform: ${(p) => (p.disabled ? "none" : "translateY(-1px)")};
    box-shadow: ${(p) =>
      p.disabled
        ? "0 1px 2px rgba(0, 0, 0, 0.03)"
        : "0 3px 6px rgba(0, 0, 0, 0.06)"};
  }
`;

// Left side of file item with icon and info
const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0; /* Allows text to truncate */
`;

const FileIcon = styled.div<{ state: DocumentState }>`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 4px;
  background-color: ${(p) =>
    p.state === DocumentState.MISSING ? "#fff0f0" : "#f0f7ff"};
  color: ${(p) => (p.state === DocumentState.MISSING ? "#ff6b6b" : "#0071e3")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0; /* Enables text truncation */
`;

// Badge showing file type
const FileTypeBadge = styled.span<{ state: DocumentState; status?: string }>`
  background-color: ${(p) =>
    p.status === "Signed"
      ? "#e3f6ec"
      : p.status === "Filled"
      ? "#fff7e0"
      : p.state === DocumentState.MISSING
      ? "#ffefef"
      : "#f0f7ff"};
  color: ${(p) =>
    p.status === "Signed"
      ? "#1d8450"
      : p.status === "Filled"
      ? "#b0851f"
      : p.state === DocumentState.MISSING
      ? "#ff6b6b"
      : "#0071e3"};
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
  display: inline-block;
`;

// Name of the file, with Apple-style typography
const FileName = styled.div<{ state: DocumentState; status?: string }>`
  font-size: 13px;
  font-weight: 500;
  color: ${(p) =>
    p.status === "Signed"
      ? "#1d8450"
      : p.status === "Filled"
      ? "#b0851f"
      : p.state === DocumentState.MISSING
      ? "#ff6b6b"
      : "#333"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Container for action icons
const Actions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

// Apple-style button
const ActionButton = styled.button<{ disabled: boolean; danger?: boolean }>`
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  padding: 5px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: ${(p) => (p.disabled ? "#ccc" : p.danger ? "#ff3b30" : "#0071e3")};
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};

  &:hover {
    background-color: ${(p) =>
      p.disabled ? "transparent" : p.danger ? "#fff5f5" : "#f0f7ff"};
  }
`;

// Upload area - more compact
const UploadArea = styled.div<{ isDragging: boolean; disabled: boolean }>`
  border: 2px dashed ${(p) => (p.isDragging ? "#0071e3" : "#e0e0e0")};
  border-radius: 10px;
  padding: 16px;
  margin: 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => (p.isDragging ? "#f0f7ff" : "#f9f9f9")};
  transition: all 0.2s ease;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${(p) => (p.disabled ? "#f9f9f9" : "#f0f7ff")};
    border-color: ${(p) => (p.disabled ? "#e0e0e0" : "#0071e3")};
  }
`;

const UploadContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UploadIcon = styled.div`
  font-size: 20px;
  color: #0071e3;
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #666;
`;

// PDF Preview Dialog with Apple-style design
export const FilePreview: React.FC<{
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}> = ({ fileUrl, fileName, onClose }) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const lowerFileName = fileName?.toLowerCase() || "";
  const isImage = imageExtensions.some((ext) => lowerFileName.endsWith(ext));

  // Zoom state for images
  const [zoom, setZoom] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const imgContainerRef = React.useRef<HTMLDivElement>(null);

  // Reset zoom and position when file changes
  React.useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setDragging(false);
    setStartDrag(null);
  }, [fileUrl]);

  // Mouse/touch event handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !startDrag) return;
    setPosition({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  };
  const handleMouseUp = () => {
    setDragging(false);
    setStartDrag(null);
  };
  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom === 1) return;
    const touch = e.touches[0];
    setDragging(true);
    setStartDrag({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !startDrag) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - startDrag.x,
      y: touch.clientY - startDrag.y,
    });
  };
  const handleTouchEnd = () => {
    setDragging(false);
    setStartDrag(null);
  };

  // Clamp zoom
  const minZoom = 0.2;
  const maxZoom = 5;
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, maxZoom));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, minZoom));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <DialogOverlay
      onClick={onClose}
      style={{
        justifyContent: "flex-end",
        alignItems: "stretch",
        background: "rgba(0, 0, 0, 0.4)",
      }}
    >
      <DialogContainer
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: "0",
          borderRadius: "16px 0 0 16px",
          width: "45%",
          maxWidth: "600px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-2px 0 25px rgba(0, 0, 0, 0.2)",
        }}
      >
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div
          style={{
            padding: "16px",
            flex: "1",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isImage ? (
            <>
              {/* Zoom Controls */}
              <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
                {/* Only show zoom out if zoom > 1 */}
                <Button
                  variant="contained"
                  disabled={zoom === 1}
                  onClick={handleZoomOut}
                >
                  -
                </Button>
                <span
                  style={{
                    marginTop: 7,
                    minWidth: 40,
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="contained"
                  onClick={handleZoomIn}
                  disabled={zoom >= maxZoom}
                >
                  +
                </Button>
                {/*<Button variant="text" onClick={handleReset} disabled={zoom === 1 && position.x === 0 && position.y === 0}>Reset</Button>*/}
              </div>
              <div
                ref={imgContainerRef}
                style={{
                  width: "100%",
                  height: "70vh",
                  maxWidth: 560,
                  maxHeight: 700,
                  overflow: zoom > 1 ? "scroll" : "hidden",
                  background: "#fff",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px #0001",
                  cursor:
                    zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
                  position: "relative",
                  userSelect: "none",
                  touchAction: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={fileUrl}
                  alt={fileName}
                  draggable={false}
                  style={{
                    transform: `scale(${zoom}) translate(${
                      position.x / zoom
                    }px, ${position.y / zoom}px)`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 2px 8px #0001",
                    transition: dragging ? "none" : "transform 0.2s",
                    cursor:
                      zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
                    userSelect: "none",
                  }}
                />
              </div>
            </>
          ) : (
            <iframe
              src={fileUrl}
              title={fileName}
              width="100%"
              style={{
                border: "none",
                flex: "1",
                minHeight: "500px",
                borderRadius: "8px",
              }}
            />
          )}
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

// Email Dialog for sending file to signer
const EmailDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
  fileNames: string[];
}> = ({ isOpen, onClose, onSend, fileNames }) => {
  const [email, setEmail] = React.useState("");
  if (!isOpen) return null;
  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: "16px", maxWidth: "450px" }}
      >
        <DialogHeader>
          <DialogTitle>
            Send{" "}
            {fileNames.length > 1
              ? `${fileNames.length} files`
              : `"${fileNames[0]}"`}
          </DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: 24 }}>
          <label
            style={{
              fontWeight: 500,
              fontSize: 16,
              display: "block",
              marginBottom: "8px",
            }}
          >
            Recipient Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              marginBottom: "24px",
            }}
            autoFocus
          />
          <DialogActions
            style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
          >
            <Button variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                onSend(email);
                setEmail("");
              }}
              style={{
                backgroundColor: "#0071e3",
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              Send
            </Button>
          </DialogActions>
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

// Single FileItem component with redesigned Apple look
const FileItem: React.FC<{
  fileId: string;
  fileName: string;
  fileType: string;
  state: DocumentState;
  status?: string;
  disabled: boolean;
  versions?: FileAreaDocumentVersion[];
  onUpload?: (fileType: string, file: File, mode: "auto" | "manual") => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onAutoFill?: (fileId: string, documentType: string, fileName: string) => void;
  onDownloadVersion?: (versionId: string) => void;
  onRequestUpload: (
    fileType: string,
    file: File,
    mode: "auto" | "manual",
    status?: string
  ) => void;
  isAutoFill?: boolean;
  autoFillingDocId?: string | null;
}> = ({
  fileId,
  fileName,
  fileType,
  state,
  status,
  disabled,
  versions = [],
  onUpload,
  onDelete,
  onPreview,
  onAutoFill,
  onDownloadVersion,
  onRequestUpload,
  isAutoFill = false,
  autoFillingDocId,
}) => {
  const handleUpload = async (
    mode: "auto" | "manual" = "manual",
    selectedStatus?: string
  ) => {
    if (disabled) return;

    // If a status is already selected (from dropdown), use it directly
    if (selectedStatus) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;
        const file = files[0];
        onRequestUpload(fileType, file, mode, selectedStatus);
      };
      input.click();
      return;
    }

    // For general files (fileType === 'כללי'), use GENERAL status directly
    if (fileType === "כללי") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;
        const file = files[0];
        onRequestUpload(fileType, file, mode, DocumentState.GENERAL); // Use enum value directly for consistency
      };
      input.click();
      return;
    }

    // Otherwise show status selection dialog
    setShowUploadStatusDialog(true);
  };

  // State for dialogs
  const [showUploadStatusDialog, setShowUploadStatusDialog] = useState(false);

  const handleDelete = () => {
    if (disabled || state === DocumentState.MISSING || !onDelete) return;
    onDelete(fileId);
  };

  const handlePreview = () => {
    if (state === DocumentState.MISSING || !onPreview) return;
    onPreview(fileId, fileName || "");
  };

  // Create upload status dialog component
  const UploadStatusDialog = () => {
    if (!showUploadStatusDialog) return null;
    return (
      <DialogOverlay onClick={() => setShowUploadStatusDialog(false)}>
        <DialogContainer onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>העלאת מסמך</DialogTitle>
            <DialogCloseButton onClick={() => setShowUploadStatusDialog(false)}>
              ×
            </DialogCloseButton>
          </DialogHeader>
          <div style={{ padding: "20px" }}>
            <p>בחר את סטטוס המסמך שברצונך להעלות:</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <Button
                onClick={() => {
                  setShowUploadStatusDialog(false);
                  handleUpload("manual", DocumentState.UPLOADED);
                }}
                style={{
                  backgroundColor: "#f0f7ff",
                  color: "#0071e3",
                  border: "1px solid #0071e3",
                  fontWeight: "bold",
                  position: "relative",
                  paddingRight: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ריק
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#0071e3",
                  }}
                ></span>
              </Button>
              <Button
                onClick={() => {
                  setShowUploadStatusDialog(false);
                  handleUpload("manual", "Filled");
                }}
                style={{
                  backgroundColor: "#fff7e0",
                  color: "#b0851f",
                  border: "1px solid #b0851f",
                  fontWeight: "bold",
                  position: "relative",
                  paddingRight: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                מלא עם פרטים
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#b0851f",
                  }}
                ></span>
              </Button>
              <Button
                onClick={() => {
                  setShowUploadStatusDialog(false);
                  handleUpload("manual", DocumentState.SIGNED);
                }}
                style={{
                  backgroundColor: "#e3f6ec",
                  color: "#1d8450",
                  border: "1px solid #1d8450",
                  fontWeight: "bold",
                  position: "relative",
                  paddingRight: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                חתום
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#1d8450",
                  }}
                ></span>
              </Button>
            </div>
          </div>
        </DialogContainer>
      </DialogOverlay>
    );
  };

  // Create refs for dialog elements
  const versionsDialogRef = React.useRef<HTMLDivElement>(null);

  // Create state for dialog instead of dropdown
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);

  // Handle clicking outside the dialog to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showVersionsDialog &&
        versionsDialogRef.current &&
        !versionsDialogRef.current.contains(target)
      ) {
        setShowVersionsDialog(false);
      }
    };

    if (showVersionsDialog) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVersionsDialog]);

  // Check if this file has versions
  const hasVersions = fileType !== "כללי" && versions && versions.length > 0;

  return (
    <>
      <FileItemContainer
        disabled={disabled}
        state={state}
        status={status}
        hasVersions={hasVersions}
      >
        <FileInfo>
          <FileIcon state={state}>
            <FaFileAlt />
          </FileIcon>
          <FileDetails>
            <FileTypeBadge state={state} status={status}>
              {fileType}
            </FileTypeBadge>
            <FileName
              state={state}
              status={status}
              className="file-name-clickable"
              style={{
                cursor: hasVersions ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (hasVersions) {
                  console.log("Opening versions dialog from file name");
                  setShowVersionsDialog(true);
                }
              }}
            >
              <div>
                {state === DocumentState.UPLOADED
                  ? fileName
                  : "Missing document"}
              </div>
              {hasVersions && (
                <span
                  style={{
                    marginRight: "5px",
                    marginLeft: "5px",
                    fontSize: "10px",
                    color: "#0071e3",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#e6f0fd",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  <FaHistory style={{ marginLeft: "4px" }} /> הורדה
                </span>
              )}
            </FileName>
          </FileDetails>
        </FileInfo>
        <Actions>
          {state === DocumentState.MISSING ? (
            <ActionButton
              disabled={disabled}
              onClick={() => handleUpload("manual")}
              title="העלה מסמך"
            >
              <FaUpload />
            </ActionButton>
          ) : (
            <>
              <ActionButton
                disabled={false}
                onClick={handlePreview}
                title="תצוגה מקדימה"
              >
                <FaEye />
              </ActionButton>

              {/* Auto-fill button - only for Uploaded status and when isAutoFill is true */}
              {isAutoFill &&
                onAutoFill &&
                status === DocumentState.UPLOADED && (
                  <ActionButton
                    disabled={disabled || autoFillingDocId === fileId}
                    onClick={() => onAutoFill(fileId, fileType, fileName || "")}
                    title="מילוי אוטומטי"
                    style={{
                      position: "relative",
                    }}
                  >
                    {autoFillingDocId === fileId ? (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "50%",
                        }}
                      >
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <FaPen />
                    )}
                  </ActionButton>
                )}

              {/* Upload replacement button - only for non-Signed documents and non-general files */}
              {status !== DocumentState.SIGNED &&
                status !== DocumentState.GENERAL && (
                  <ActionButton
                    disabled={disabled}
                    onClick={() => handleUpload("manual")}
                    title="חתום והעלה מסמך"
                    style={{
                      color:
                        status === DocumentState.FILLED ? "#b0851f" : "#0071e3",
                    }}
                  >
                    <FaUpload />
                  </ActionButton>
                )}

              <ActionButton
                disabled={disabled}
                danger
                onClick={handleDelete}
                title="מחיקה"
              >
                <FaTrash />
              </ActionButton>
            </>
          )}
        </Actions>
      </FileItemContainer>
      {showUploadStatusDialog && <UploadStatusDialog />}

      {/* Versions Dialog */}
      {showVersionsDialog && hasVersions && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowVersionsDialog(false)}
        >
          <div
            ref={versionsDialogRef}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              width: "400px",
              maxWidth: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              direction: "rtl",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px" }}>
                גרסאות מסמך: {fileType}
              </h3>
              <button
                onClick={() => setShowVersionsDialog(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {versions &&
                versions.map((version) => (
                  <div
                    key={version.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 15px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #eee",
                      marginBottom: "4px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {version.name}
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "4px" }}>
                        {new Date(version.created_at).toLocaleDateString(
                          "he-IL"
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          marginTop: "4px",
                          color:
                            version.status === "Signed"
                              ? "#1d8450"
                              : version.status === "Filled"
                              ? "#b0851f"
                              : "#0071e3",
                          fontWeight: "bold",
                        }}
                      >
                        {version.status}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onDownloadVersion) {
                          onDownloadVersion(version.id);
                        }
                      }}
                      style={{
                        background: "#0071e3",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "white",
                        fontSize: "14px",
                        padding: "10px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "bold",
                        position: "relative",
                      }}
                    >
                      {autoFillingDocId === version.id ? (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0, 113, 227, 0.8)",
                            borderRadius: "6px",
                          }}
                        >
                          <WhiteLoadingSpinner />
                        </div>
                      ) : (
                        <>
                          <FaDownload style={{ fontSize: "14px" }} /> הורד
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main FileArea component with tabbed interface
type FileAreaProps = {
  files: FileAreaDocument[];
  disabled: boolean;
  onUpload?: (
    fileType: string,
    file: File,
    mode: "auto" | "manual",
    status?: string
  ) => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onAutoFill?: (fileId: string, documentType: string, fileName: string) => void;
  onDownloadVersion?: (versionId: string) => void;
  onUploadGeneral?: (file: File) => void;
  isAutoFill?: boolean;
  showAddDoc?: boolean;
  autoFillingDocId?: string | null;
};

const FileArea: React.FC<FileAreaProps> = ({
  files,
  disabled,
  onUpload,
  onDelete,
  onPreview,
  onAutoFill,
  onDownloadVersion,
  onUploadGeneral,
  isAutoFill,
  showAddDoc,
  autoFillingDocId,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleRequestUpload = (
    fileType: string,
    file: File,
    mode: "auto" | "manual" = "manual",
    status?: string
  ) => {
    if (onUpload) {
      console.log(`FileArea handleRequestUpload called with status: ${status}`);
      // @ts-ignore - We know our interface accepts 4 parameters
      onUpload(fileType, file, mode, status);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || !onUploadGeneral) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUploadGeneral(files[0]);
    }
  };
  const handleGeneralUploadClick = () => {
    if (disabled || !onUploadGeneral) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpeg,.png";
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      onUploadGeneral(files[0]);
    };
    input.click();
  };
  // Group files by document type for better organization
  const groupedFiles: Record<string, FileAreaDocument[]> = {};

  // Group files by their type
  files.forEach((file) => {
    if (!groupedFiles[file.fileType]) {
      groupedFiles[file.fileType] = [];
    }
    groupedFiles[file.fileType].push(file);
  });

  return (
    <FileAreaContainer>
      <FileAreaContent>
        <FileListContainer>
          {files.length === 0 ? (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                color: "#888",
                fontSize: "14px",
              }}
            >
              אין מסמכים זמינים
            </div>
          ) : (
            Object.entries(groupedFiles).map(
              ([fileType, typeFiles], groupIndex) => (
                <div key={`group-${fileType}`}>
                  {/* Files of this type */}
                  {typeFiles.map((file, index) => {
                    console.log(
                      `Rendering FileItem for ${file.fileType} with versions:`,
                      file.versions
                    );
                    return (
                      <FileItem
                        key={`${file.fileType}-${index}`}
                        fileId={file.fileId || ""}
                        fileName={file.fileName || ""}
                        fileType={file.fileType}
                        state={file.state}
                        status={file.status}
                        disabled={disabled}
                        onUpload={onUpload}
                        onDelete={onDelete}
                        onPreview={onPreview}
                        onAutoFill={onAutoFill}
                        onDownloadVersion={onDownloadVersion}
                        onRequestUpload={handleRequestUpload}
                        isAutoFill={isAutoFill}
                        versions={file.versions}
                        autoFillingDocId={autoFillingDocId}
                      />
                    );
                  })}
                </div>
              )
            )
          )}
        </FileListContainer>
      </FileAreaContent>
    </FileAreaContainer>
  );
};

export default FileArea;
