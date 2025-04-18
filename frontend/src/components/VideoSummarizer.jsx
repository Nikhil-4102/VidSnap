import React, { useState } from "react";
import { RefreshCw, Play, Download, AlertCircle } from "lucide-react";

function VideoSummarizer() {
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [currentThumbnail, setCurrentThumbnail] = useState("");
  const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(null);
  const [includeHuman, setIncludeHuman] = useState(false);
  const [includeText, setIncludeText] = useState(false);

  const Alert = ({ children, variant = "default" }) => (
    <div className={`p-4 rounded-md flex items-center gap-2 ${variant === "destructive" ? "bg-red-100 text-red-800" : "bg-gray-100"}`}>
      <AlertCircle className="h-4 w-4" />
      <div>{children}</div>
    </div>
  );

  const validateYouTubeUrl = (url) => {
    if (!url) return false;
    const patterns = {
      standard: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=([a-zA-Z0-9_-]{11}))(?:\S+)?$/,
      shortened: /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\S*)?$/,
      embedded: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\S*)?$/,
      mobile: /^(?:https?:\/\/)?(?:m\.)?youtube\.com\/watch\?(?=.*v=([a-zA-Z0-9_-]{11}))(?:\S+)?$/,
    };

    for (const [_, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return { isValid: true, videoId: match[1] };
      }
    }

    return {
      isValid: false,
      error: "Invalid YouTube URL. Please enter a valid YouTube video URL.",
    };
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
    const validation = validateYouTubeUrl(newUrl);
    setUrlError(validation.isValid ? "" : validation.error);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();

    const validation = validateYouTubeUrl(videoUrl);
    if (!validation.isValid) {
      setUrlError(validation.error);
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");
    setCurrentThumbnail("");
    setProgress(10);
    setElapsedTime(null);
    const start = performance.now();

    try {
      const summaryRes = await fetch("https://flaskyt-production.up.railway.app/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl, video_id: validation.videoId }),
      });

      setProgress(50);
      if (!summaryRes.ok) throw new Error("Failed to fetch summary");
      const summaryData = await summaryRes.json();

      const thumbnailRes = await fetch("https://flaskyt-production.up.railway.app/get_current_thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl, video_id: validation.videoId }),
      });

      setProgress(75);
      if (!thumbnailRes.ok) throw new Error("Failed to fetch thumbnail");
      const thumbnailData = await thumbnailRes.json();

      setSummary(summaryData.summary);
      setCurrentThumbnail(thumbnailData.thumbnail_url);
      setProgress(100);
      setElapsedTime((performance.now() - start) / 1000);
    } catch (err) {
      setError("Error processing video. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://rockingyash-yt-thumbnail.hf.space/generate_thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          video_url: videoUrl,
          includeHuman,
          includeText,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate thumbnails");
      const data = await response.json();
      setGeneratedThumbnails(data.public_id);
    } catch (err) {
      setError("Error generating thumbnails.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `thumbnail_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatElapsedTime = (seconds) => {
    seconds = Math.round(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const ProgressBar = () =>
    loading && (
      <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
        <div
          style={{ width: `${progress}%` }}
          className="bg-blue-500 h-2 rounded-full transition-all duration-200"
        ></div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-white">Video Summarizer & Thumbnail Generator</h1>
      </header>

      <main className="space-y-8">
        <section className="space-y-4">
          <form onSubmit={handleVideoSubmit}>
            <input
              type="text"
              placeholder="Enter YouTube Video URL"
              value={videoUrl}
              onChange={handleUrlChange}
              className={`w-full p-3 border rounded-lg ${urlError ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {urlError && <Alert variant="destructive">{urlError}</Alert>}

            <button
              type="submit"
              disabled={loading || !!urlError}
              className={`mt-4 w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 ${
                loading || urlError ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-5 w-5" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </form>
        </section>

        <ProgressBar />

        {error && <Alert variant="destructive">{error}</Alert>}

        <section className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Video Summary</h3>
          <div className="prose max-w-none">
            {summary ? <p>{summary}</p> : <p className="text-gray-500">Video summary will appear here...</p>}
          </div>
        </section>

        {elapsedTime && (
          <div className="text-right mt-4 text-gray-700">
            <p>Total Time To Generate Summary: {formatElapsedTime(elapsedTime)}</p>
          </div>
        )}

        {currentThumbnail && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Current Video Thumbnail</h3>
            <img src={currentThumbnail} alt="Current Video Thumbnail" className="rounded-lg w-full object-cover" />
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" checked={includeHuman} onChange={(e) => setIncludeHuman(e.target.checked)} />
              <span className="text-gray-700">Include Human</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" checked={includeText} onChange={(e) => setIncludeText(e.target.checked)} />
              <span className="text-gray-700">Include Text</span>
            </label>
          </div>

          <button
            onClick={generateThumbnails}
            disabled={!summary}
            className={`w-full bg-green-500 text-white p-3 rounded-lg ${!summary ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"}`}
          >
            Generate New Thumbnails
          </button>

          <ProgressBar />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedThumbnails.map((public_id, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow space-y-4">
                <img src={ public_id } alt={`Generated Thumbnail ${index + 1}`} className="rounded-lg w-full" />
                <button
                  onClick={() => downloadImage(public_id)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default VideoSummarizer;
