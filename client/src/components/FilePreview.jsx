function FilePreview({ content, type, isSent }) {
  if (type === "image") {
    return (
      <img
        src={content}
        alt="Shared image"
        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(content, "_blank")}
      />
    );
  }

  if (type === "file") {
    const fileName = content.split("/").pop();
    const linkClass = isSent
      ? "flex items-center gap-2 underline text-sm text-primary-foreground"
      : "flex items-center gap-2 underline text-sm text-foreground";

    return (
      <a
        href={content}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {fileName}
      </a>
    );
  }

  return <p className="text-sm">{content}</p>;
}

export default FilePreview;