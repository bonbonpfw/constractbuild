import React, { useState } from "react";
import styled from "styled-components";
import {
  FaTrash,
  FaUpload,
  FaDownload,
  FaEye,
  FaPen,
  FaHistory,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFile,
  FaTh,
  FaList,
  FaEnvelope,
} from "react-icons/fa";
import {
  DialogOverlay,
  DialogContainer,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  Button,
} from "../../styles/SharedStyles";
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

const LoadingSpinner = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  width: 12px;
  height: 12px;
  border: 2px solid #3b82f6;
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

const FileAreaContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 12px;
  min-height: 0;
`;

const FileAreaContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px 0;
  width: 100%;
`;

const FileItemContainer = styled.div<{
  disabled: boolean;
  state: DocumentState;
  status?: string;
}>`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  min-height: 160px;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
  }

  ${(p) => p.disabled && `
    opacity: 0.6;
    pointer-events: none;
  `}
`;

const FilePreviewArea = styled.div<{ state: DocumentState; status?: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => {
    if (p.status === "Signed") return "#f0fdf4";
    if (p.status === "Filled") return "#fefce8";
    if (p.state === DocumentState.MISSING) return "#fef2f2";
    return "#f8fafc";
  }};
  position: relative;
  font-size: 48px;
  color: ${(p) => {
    if (p.status === "Signed") return "#22c55e";
    if (p.status === "Filled") return "#eab308";
    if (p.state === DocumentState.MISSING) return "#ef4444";
    return "#64748b";
  }};
`;

const FileInfo = styled.div`
  padding: 12px;
  background: white;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: right;
  line-height: 1.2;
`;

const FileTypeLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  text-align: right;
`;

const StatusBadge = styled.div<{ status?: string; state: DocumentState }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background-color: ${(p) => {
    if (p.status === "Signed") return "#22c55e";
    if (p.status === "Filled") return "#eab308";
    if (p.state === DocumentState.MISSING) return "#ef4444";
    return "#64748b";
  }};
  color: white;
  z-index: 1;
`;

const ActionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;

  ${FileItemContainer}:hover & {
    opacity: 1;
  }
`;

const IconButton = styled.button<{ danger?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${(p) => (p.danger ? "#fecaca" : "#e2e8f0")};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(p) => (p.danger ? "#ef4444" : "#3b82f6")};
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.danger ? "#fef2f2" : "#eff6ff")};
    transform: scale(1.1);
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  color: #64748b;
  gap: 12px;
  width: 100%;
`;

const ViewToggleContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const ViewToggleButton = styled.button<{ $active: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid ${(p) => (p.$active ? "#3b82f6" : "#e2e8f0")};
  background: ${(p) => (p.$active ? "#eff6ff" : "#fff")};
  color: ${(p) => (p.$active ? "#3b82f6" : "#64748b")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:first-child {
    border-radius: 8px 0 0 8px;
    border-right: none;
  }

  &:last-child {
    border-radius: 0 8px 8px 0;
  }

  &:hover {
    background: ${(p) => (p.$active ? "#eff6ff" : "#f8fafc")};
  }
`;

const FileTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  direction: rtl;
`;

const FileTableHead = styled.thead`
  background: #f8fafc;
`;

const FileTableTh = styled.th`
  padding: 12px 16px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
`;

const FileTableTd = styled.td`
  padding: 12px 16px;
  text-align: right;
  font-size: 13px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
`;

const FileTableRow = styled.tr`
  transition: background 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const TableStatusBadge = styled.span<{ status?: string; state: DocumentState }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background-color: ${(p) => {
    if (p.status === "Signed") return "#dcfce7";
    if (p.status === "Filled") return "#fef9c3";
    if (p.state === DocumentState.MISSING) return "#fee2e2";
    return "#f1f5f9";
  }};
  color: ${(p) => {
    if (p.status === "Signed") return "#166534";
    if (p.status === "Filled") return "#854d0e";
    if (p.state === DocumentState.MISSING) return "#dc2626";
    return "#475569";
  }};
`;

const TableActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-start;
`;

const TableIconButton = styled.button<{ danger?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid ${(p) => (p.danger ? "#fecaca" : "#e2e8f0")};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(p) => (p.danger ? "#ef4444" : "#3b82f6")};
  transition: all 0.2s ease;
  font-size: 12px;

  &:hover {
    background: ${(p) => (p.danger ? "#fef2f2" : "#eff6ff")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FilePreview: React.FC<{
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}> = ({ fileUrl, fileName, onClose }) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const lowerFileName = fileName?.toLowerCase() || "";
  const isImage = imageExtensions.some((ext) => lowerFileName.endsWith(ext));

  const [zoom, setZoom] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setDragging(false);
  }, [fileUrl]);

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

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.2));

  return (
    <DialogOverlay onClick={onClose} style={{ justifyContent: "flex-end", alignItems: "stretch", background: "rgba(0, 0, 0, 0.4)" }}>
      <DialogContainer onClick={(e) => e.stopPropagation()} style={{ margin: "0", borderRadius: "16px 0 0 16px", width: "45%", maxWidth: "600px", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-2px 0 25px rgba(0, 0, 0, 0.2)" }}>
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: "16px", flex: "1", overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {isImage ? (
            <>
              <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
                <Button variant="contained" disabled={zoom === 1} onClick={handleZoomOut}>-</Button>
                <span style={{ marginTop: 7, minWidth: 40, textAlign: "center", fontWeight: 500 }}>{Math.round(zoom * 100)}%</span>
                <Button variant="contained" onClick={handleZoomIn} disabled={zoom >= 5}>+</Button>
              </div>
              <div
                style={{
                  width: "100%", height: "70vh", maxWidth: 560, maxHeight: 700,
                  overflow: zoom > 1 ? "scroll" : "hidden", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001",
                  cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default", position: "relative", userSelect: "none", touchAction: "none",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              >
                <img
                  src={fileUrl} alt={fileName} draggable={false}
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, background: "#fff",
                    boxShadow: "0 2px 8px #0001", transition: dragging ? "none" : "transform 0.2s",
                    cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default", userSelect: "none",
                  }}
                />
              </div>
            </>
          ) : (
            <iframe src={fileUrl} title={fileName} width="100%" style={{ border: "none", flex: "1", minHeight: "500px", borderRadius: "8px" }} />
          )}
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

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
  onRequestUpload: (fileType: string, file: File, mode: "auto" | "manual", status?: string) => void;
  isAutoFill?: boolean;
  autoFillingDocId?: string | null;
}> = ({
  fileId, fileName, fileType, state, status, disabled, versions = [],
  onDelete, onPreview, onAutoFill, onDownloadVersion, onRequestUpload, isAutoFill = false, autoFillingDocId,
}) => {
  const [showUploadStatusDialog, setShowUploadStatusDialog] = useState(false);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const versionsDialogRef = React.useRef<HTMLDivElement>(null);

  const handleUpload = async (mode: "auto" | "manual" = "manual", selectedStatus?: string) => {
    if (disabled) return;
    if (selectedStatus || fileType === "כללי") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files?.length) onRequestUpload(fileType, files[0], mode, selectedStatus || DocumentState.GENERAL);
      };
      input.click();
      return;
    }
    setShowUploadStatusDialog(true);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVersionsDialog && versionsDialogRef.current && !versionsDialogRef.current.contains(event.target as Node)) {
        setShowVersionsDialog(false);
      }
    };
    if (showVersionsDialog) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVersionsDialog]);

  const hasVersions = fileType !== "כללי" && versions?.length > 0;

  const renderFileIcon = () => {
    const name = fileName?.toLowerCase() || "";
    if (name.endsWith(".pdf")) return <FaFilePdf />;
    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")) return <FaFileImage />;
    if (name.endsWith(".doc") || name.endsWith(".docx")) return <FaFileWord />;
    return <FaFile />;
  };

  const getStatusLabelHe = (status?: string, state?: DocumentState) => {
    if (status === "Signed") return "חתום";
    if (status === "Filled") return "מלא";
    if (state === DocumentState.MISSING) return "חסר";
    return "הועלה";
  };

  return (
    <>
      <FileItemContainer disabled={disabled} state={state} status={status}>
        <StatusBadge state={state} status={status}>{getStatusLabelHe(status, state)}</StatusBadge>
        <FilePreviewArea state={state} status={status}>{renderFileIcon()}</FilePreviewArea>
        <FileInfo>
          <FileName title={fileType || fileName || ""}>
            {fileType || fileName}
          </FileName>
          <FileTypeLabel>
            {state === DocumentState.UPLOADED ? fileName : ""}
          </FileTypeLabel>
        </FileInfo>
        <ActionOverlay>
          {state === DocumentState.MISSING ? (
            <IconButton disabled={disabled} onClick={() => handleUpload("manual")} title="העלה מסמך"><FaUpload /></IconButton>
          ) : (
            <>
              <IconButton onClick={() => onPreview?.(fileId, fileName || "")} title="תצוגה מקדימה"><FaEye /></IconButton>
              <IconButton
                onClick={() => {
                  if (hasVersions) {
                    setShowVersionsDialog(true);
                  } else {
                    onDownloadVersion?.(fileId);
                  }
                }}
                title="הורדה"
              >
                <FaDownload />
              </IconButton>
              {isAutoFill && onAutoFill && status === DocumentState.UPLOADED && (
                <IconButton disabled={disabled || autoFillingDocId === fileId} onClick={() => onAutoFill(fileId, fileType, fileName || "")} title="מילוי אוטומטי">
                  {autoFillingDocId === fileId ? <LoadingSpinner /> : <FaPen />}
                </IconButton>
              )}
              {status !== DocumentState.SIGNED && status !== DocumentState.GENERAL && (
                <IconButton disabled={disabled} onClick={() => handleUpload("manual")} title="עדכן גרסה"><FaUpload /></IconButton>
              )}
              <IconButton danger onClick={() => onDelete?.(fileId)} title="מחיקה"><FaTrash /></IconButton>
            </>
          )}
        </ActionOverlay>
      </FileItemContainer>

      {showUploadStatusDialog && (
        <DialogOverlay onClick={() => setShowUploadStatusDialog(false)}>
          <DialogContainer onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>העלאת מסמך</DialogTitle>
              <DialogCloseButton onClick={() => setShowUploadStatusDialog(false)}>&times;</DialogCloseButton>
            </DialogHeader>
            <div style={{ padding: "20px" }}>
              <p>בחר את סטטוס המסמך שברצונך להעלות:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                {[
                  { label: "ריק", status: DocumentState.UPLOADED, bg: "#f0f7ff", color: "#0071e3" },
                  { label: "מלא עם פרטים", status: "Filled", bg: "#fff7e0", color: "#b0851f" },
                  { label: "חתום", status: DocumentState.SIGNED, bg: "#e3f6ec", color: "#1d8450" }
                ].map(opt => (
                  <Button key={opt.label} onClick={() => { setShowUploadStatusDialog(false); handleUpload("manual", opt.status); }} style={{ backgroundColor: opt.bg, color: opt.color, border: `1px solid ${opt.color}`, fontWeight: "bold", position: "relative", paddingRight: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {opt.label}
                    <span style={{ position: "absolute", right: "10px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: opt.color }}></span>
                  </Button>
                ))}
              </div>
            </div>
          </DialogContainer>
        </DialogOverlay>
      )}

      {showVersionsDialog && hasVersions && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowVersionsDialog(false)}>
          <div ref={versionsDialogRef} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", width: "400px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", direction: "rtl" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>גרסאות מסמך: {fileType}</h3>
              <button onClick={() => setShowVersionsDialog(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#666" }}>&times;</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {versions.map((version) => (
                <div key={version.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #eee" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "bold" }}>{version.name}</div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>{new Date(version.created_at).toLocaleDateString("he-IL")}</div>
                    <div style={{ fontSize: "12px", marginTop: "4px", color: version.status === "Signed" ? "#1d8450" : version.status === "Filled" ? "#b0851f" : "#0071e3", fontWeight: "bold" }}>{version.status}</div>
                  </div>
                  <button onClick={() => onDownloadVersion?.(version.id)} style={{ background: "#0071e3", border: "none", borderRadius: "6px", cursor: "pointer", color: "white", fontSize: "14px", padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", position: "relative" }}>
                    {autoFillingDocId === version.id ? <WhiteLoadingSpinner /> : <><FaDownload size={14} /> הורד</>}
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

type FileAreaProps = {
  files: FileAreaDocument[];
  disabled: boolean;
  onUpload?: (fileType: string, file: File, mode: "auto" | "manual", status?: string) => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onAutoFill?: (fileId: string, documentType: string, fileName: string) => void;
  onDownloadVersion?: (versionId: string) => void;
  onUploadGeneral?: (file: File) => void;
  isAutoFill?: boolean;
  autoFillingDocId?: string | null;
  onDownloadAll?: () => void;
  onEmailAll?: () => void;
  downloadAllDisabled?: boolean;
  emailAllDisabled?: boolean;
  isGeneralMode?: boolean; // Simplified mode: no status column, no version upload
};

const FileArea: React.FC<FileAreaProps> = ({
  files, disabled, onUpload, onDelete, onPreview, onAutoFill, onDownloadVersion, onUploadGeneral, isAutoFill, autoFillingDocId,
  onDownloadAll, onEmailAll, downloadAllDisabled, emailAllDisabled, isGeneralMode = false,
}) => {
  // General mode is enabled if explicitly set OR if onUploadGeneral is provided
  const generalMode = isGeneralMode || !!onUploadGeneral;
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [uploadDialogFileType, setUploadDialogFileType] = useState<string | null>(null);
  const [versionsDialogFile, setVersionsDialogFile] = useState<FileAreaDocument | null>(null);

  const getStatusLabelHe = (status?: string, state?: DocumentState) => {
    if (status === "Signed") return "חתום";
    if (status === "Filled") return "מלא";
    if (state === DocumentState.MISSING) return "חסר";
    return "הועלה";
  };

  const renderFileIcon = (fileName: string | null) => {
    const name = fileName?.toLowerCase() || "";
    if (name.endsWith(".pdf")) return <FaFilePdf />;
    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")) return <FaFileImage />;
    if (name.endsWith(".doc") || name.endsWith(".docx")) return <FaFileWord />;
    return <FaFile />;
  };

  const handleTableUpload = (fileType: string, status?: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    input.onchange = (e: Event) => {
      const inputFiles = (e.target as HTMLInputElement).files;
      if (inputFiles?.length) onUpload?.(fileType, inputFiles[0], "manual", status);
    };
    input.click();
  };

  return (
    <FileAreaContainer>
      <FileAreaContent>
        {files.length === 0 ? (
          <EmptyStateContainer>
            <FaFile size={40} style={{ opacity: 0.5 }} />
            <div>אין מסמכים זמינים</div>
            {onUploadGeneral && (
              <TableIconButton
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.onchange = (e: Event) => {
                    const inputFiles = (e.target as HTMLInputElement).files;
                    if (inputFiles?.length) {
                      Array.from(inputFiles).forEach((f) => onUploadGeneral(f));
                    }
                  };
                  input.click();
                }}
                title="העלאת קבצים"
                style={{ marginTop: 12 }}
              >
                <FaUpload />
              </TableIconButton>
            )}
          </EmptyStateContainer>
        ) : (
          <>
            <ViewToggleContainer>
              <ViewToggleButton
                $active={viewMode === "cards"}
                onClick={() => setViewMode("cards")}
                title="תצוגת כרטיסים"
              >
                <FaTh />
              </ViewToggleButton>
              <ViewToggleButton
                $active={viewMode === "table"}
                onClick={() => setViewMode("table")}
                title="תצוגת טבלה"
              >
                <FaList />
              </ViewToggleButton>
              <div style={{ flex: 1 }} />
              {onUploadGeneral && (
                <TableIconButton
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = ".pdf,.jpg,.jpeg,.png";
                    input.onchange = (e: Event) => {
                      const inputFiles = (e.target as HTMLInputElement).files;
                      if (inputFiles?.length) {
                        Array.from(inputFiles).forEach((f) => onUploadGeneral(f));
                      }
                    };
                    input.click();
                  }}
                  title="העלאת קבצים"
                  style={{ marginRight: 8 }}
                >
                  <FaUpload />
                </TableIconButton>
              )}
              {onEmailAll && (
                <TableIconButton
                  onClick={onEmailAll}
                  disabled={emailAllDisabled}
                  title="שלח במייל"
                >
                  <FaEnvelope />
                </TableIconButton>
              )}
              {onDownloadAll && (
                <TableIconButton
                  onClick={onDownloadAll}
                  disabled={downloadAllDisabled}
                  title="הורד הכל"
                  style={{ marginRight: 8 }}
                >
                  <FaDownload />
                </TableIconButton>
              )}
            </ViewToggleContainer>

            {viewMode === "cards" ? (
              <FileListContainer>
                {files.map((file, index) => (
                  <FileItem
                    key={`${file.fileType}-${index}`} fileId={file.fileId || ""} fileName={file.fileName || ""} fileType={file.fileType}
                    state={file.state} status={file.status} disabled={disabled} onUpload={onUpload} onDelete={onDelete}
                    onPreview={onPreview} onAutoFill={onAutoFill} onDownloadVersion={onDownloadVersion}
                    onRequestUpload={(ft, f, m, s) => onUpload?.(ft, f, m, s)} isAutoFill={isAutoFill}
                    versions={file.versions} autoFillingDocId={autoFillingDocId}
                  />
                ))}
              </FileListContainer>
            ) : (
              <FileTable>
                <FileTableHead>
                  <tr>
                    <FileTableTh style={{ width: "40px" }}></FileTableTh>
                    <FileTableTh>סוג מסמך</FileTableTh>
                    <FileTableTh>שם קובץ</FileTableTh>
                    {!generalMode && <FileTableTh>סטטוס</FileTableTh>}
                    <FileTableTh>פעולות</FileTableTh>
                  </tr>
                </FileTableHead>
                <tbody>
                  {files.map((file, index) => (
                    <FileTableRow key={`${file.fileType}-${index}`}>
                      <FileTableTd style={{ color: "#64748b", fontSize: "18px" }}>
                        {renderFileIcon(file.fileName)}
                      </FileTableTd>
                      <FileTableTd style={{ fontWeight: 600 }}>{file.fileType}</FileTableTd>
                      <FileTableTd>{file.fileName || "-"}</FileTableTd>
                      {!generalMode && (
                        <FileTableTd>
                          <TableStatusBadge status={file.status} state={file.state}>
                            {getStatusLabelHe(file.status, file.state)}
                          </TableStatusBadge>
                        </FileTableTd>
                      )}
                      
                      <FileTableTd>
                        <TableActions>
                          {file.state === DocumentState.MISSING ? (
                            <TableIconButton
                              disabled={disabled}
                              onClick={() => {
                                if (generalMode) {
                                  handleTableUpload(file.fileType);
                                } else {
                                  setUploadDialogFileType(file.fileType);
                                }
                              }}
                              title="העלה מסמך"
                            >
                              <FaUpload />
                            </TableIconButton>
                          ) : (
                            <>
                              <TableIconButton
                                onClick={() => onPreview?.(file.fileId || "", file.fileName || "")}
                                title="תצוגה מקדימה"
                              >
                                <FaEye />
                              </TableIconButton>
                              <TableIconButton
                                onClick={() => {
                                  const hasVersions = !generalMode && file.versions && file.versions.length > 1;
                                  if (hasVersions) {
                                    setVersionsDialogFile(file);
                                  } else {
                                    onDownloadVersion?.(file.fileId || "");
                                  }
                                }}
                                title="הורדה"
                              >
                                <FaDownload />
                              </TableIconButton>
                              {!generalMode && isAutoFill && onAutoFill && file.status === DocumentState.UPLOADED && (
                                <TableIconButton
                                  disabled={disabled || autoFillingDocId === file.fileId}
                                  onClick={() => onAutoFill(file.fileId || "", file.fileType, file.fileName || "")}
                                  title="מילוי אוטומטי"
                                >
                                  {autoFillingDocId === file.fileId ? <LoadingSpinner /> : <FaPen />}
                                </TableIconButton>
                              )}
                              {!generalMode && file.status !== DocumentState.SIGNED && file.status !== DocumentState.GENERAL && (
                                <TableIconButton
                                  disabled={disabled}
                                  onClick={() => setUploadDialogFileType(file.fileType)}
                                  title="עדכן גרסה"
                                >
                                  <FaUpload />
                                </TableIconButton>
                              )}
                              <TableIconButton
                                danger
                                onClick={() => onDelete?.(file.fileId || "")}
                                title="מחיקה"
                              >
                                <FaTrash />
                              </TableIconButton>
                            </>
                          )}
                        </TableActions>
                      </FileTableTd>
                    </FileTableRow>
                  ))}
                </tbody>
              </FileTable>
            )}
          </>
        )}

        {/* Upload Status Dialog for non-general mode */}
        {uploadDialogFileType && (
          <DialogOverlay onClick={() => setUploadDialogFileType(null)}>
            <DialogContainer onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>העלאת מסמך</DialogTitle>
                <DialogCloseButton onClick={() => setUploadDialogFileType(null)}>&times;</DialogCloseButton>
              </DialogHeader>
              <div style={{ padding: "20px" }}>
                <p>בחר את סטטוס המסמך שברצונך להעלות:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                  {[
                    { label: "ריק", status: DocumentState.UPLOADED, bg: "#f0f7ff", color: "#0071e3" },
                    { label: "מלא עם פרטים", status: "Filled", bg: "#fff7e0", color: "#b0851f" },
                    { label: "חתום", status: DocumentState.SIGNED, bg: "#e3f6ec", color: "#1d8450" }
                  ].map(opt => (
                    <Button 
                      key={opt.label} 
                      onClick={() => { 
                        const fileType = uploadDialogFileType;
                        setUploadDialogFileType(null); 
                        handleTableUpload(fileType, opt.status); 
                      }} 
                      style={{ 
                        backgroundColor: opt.bg, 
                        color: opt.color, 
                        border: `1px solid ${opt.color}`, 
                        fontWeight: "bold", 
                        position: "relative", 
                        paddingRight: "30px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center" 
                      }}
                    >
                      {opt.label}
                      <span style={{ position: "absolute", right: "10px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: opt.color }}></span>
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContainer>
          </DialogOverlay>
        )}

        {/* Versions Dialog for table view */}
        {versionsDialogFile && versionsDialogFile.versions && versionsDialogFile.versions.length > 0 && (
          <DialogOverlay onClick={() => setVersionsDialogFile(null)}>
            <div 
              style={{ 
                backgroundColor: "white", 
                borderRadius: "12px", 
                padding: "20px", 
                width: "400px", 
                maxWidth: "90%", 
                maxHeight: "80vh", 
                overflowY: "auto", 
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", 
                direction: "rtl" 
              }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "18px" }}>גרסאות מסמך: {versionsDialogFile.fileType}</h3>
                <button onClick={() => setVersionsDialogFile(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666" }}>&times;</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {versionsDialogFile.versions.map((version) => (
                  <div key={version.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #eee" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "bold" }}>{version.name}</div>
                      <div style={{ fontSize: "13px", marginTop: "4px" }}>{new Date(version.created_at).toLocaleDateString("he-IL")}</div>
                      <div style={{ fontSize: "12px", marginTop: "4px", color: version.status === "Signed" ? "#1d8450" : version.status === "Filled" ? "#b0851f" : "#0071e3", fontWeight: "bold" }}>{version.status}</div>
                    </div>
                    <button 
                      onClick={() => {
                        onDownloadVersion?.(version.id);
                        setVersionsDialogFile(null);
                      }} 
                      style={{ background: "#0071e3", border: "none", borderRadius: "6px", cursor: "pointer", color: "white", fontSize: "14px", padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}
                    >
                      <FaDownload /> הורד
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </DialogOverlay>
        )}
      </FileAreaContent>
    </FileAreaContainer>
  );
};

export default FileArea;
