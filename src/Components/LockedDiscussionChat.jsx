import React, { useState, useEffect, useRef } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CornerUpRight,
  Lock,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { io } from "socket.io-client";

const LockedDiscussionChat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [comments, setComments] = useState([]);
  const [showReply, setShowReply] = useState({});
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [replyComment, setReplyComment] = useState({
    name: "",
    reply: "",
    id: null,
  });

  const socket = useRef(null);
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem("userId");
    return savedUserId || "user-" + Math.random().toString(36).substr(2, 9);
  });
  const [username, setUsername] = useState("");
  const [userLikes, setUserLikes] = useState(new Set());
  const [userDislikes, setUserDislikes] = useState(new Set());
  const [expandedReplies, setExpandedReplies] = useState({});

  const INITIAL_REPLIES_SHOWN = 0;

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn) {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        }
      }
    };
    
    checkAuthStatus();
    
    // Add listener for auth state changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const toggleRepliesExpansion = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const getRepliestoShow = (replies, commentId) => {
    if (!replies) return [];
    if (expandedReplies[commentId] || replies.length <= INITIAL_REPLIES_SHOWN) {
      return replies;
    }
    return replies.slice(0, INITIAL_REPLIES_SHOWN);
  };

 

  useEffect(() => {
    if (isAuthenticated) {
      socket.current = io("https://socketio-multiplayer-feature.onrender.com");

      socket.current.emit("userJoined", {
        userId,
        username,
      });

      socket.current.on("chatHistory", (messages) => {
        setComments(messages);
      });

      socket.current.on("newMessage", (message) => {
        setComments((prev) => [...prev, message]);
      });

      socket.current.on("messageUpdated", (updatedMessage) => {
        setComments((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      });

      socket.current.on("messageDeleted", (messageId) => {
        setComments((prev) => prev.filter((msg) => msg.id !== messageId));
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, userId, username]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!checked) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (socket.current) {
      socket.current.emit("sendMessage", {
        userId,
        username: newComment.name || username,
        message: newComment.comment,
      });
    }

    setNewComment({ name: "", email: "", comment: "" });
    setError("");
    setChecked(false);
  };

  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();

    if (!replyComment.name.trim()) {
      setError("Please enter your name before replying");
      return;
    }

    if (socket.current && replyComment.reply.trim()) {
      socket.current.emit("sendReply", {
        messageId: commentId,
        userId,
        username: replyComment.name,
        reply: replyComment.reply,
      });

      setReplyComment({ name: "", reply: "", id: null });
      setShowReply((prev) => ({ ...prev, [commentId]: false }));
      setError("");
    }
  };

  const handleDeleteComment = (messageId) => {
    if (socket.current) {
      socket.current.emit("deleteMessage", { messageId, userId });
    }
  };

  const handleDeleteReply = (messageId, replyId) => {
    if (socket.current) {
      socket.current.emit("deleteReply", { messageId, replyId, userId });
    }
  };

  const handleLike = (messageId) => {
  if (socket.current) {
    const isLiked = userLikes.has(messageId);
    
    if (isLiked) {
      // Unlike
      setUserLikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
      socket.current.emit("updateLikes", {
        messageId,
        action: "unlike",
        userId,
      });
    } else {
      // Like
      setUserLikes((prev) => new Set(prev).add(messageId));
      socket.current.emit("updateLikes", {
        messageId,
        action: "like",
        userId,
      });
    }
  }
};

const handleDislike = (messageId) => {
  if (socket.current) {
    const isDisliked = userDislikes.has(messageId);
    
    if (isDisliked) {
      // Undislike
      setUserDislikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
      socket.current.emit("updateLikes", {
        messageId,
        action: "undislike",
        userId,
      });
    } else {
      // Dislike
      setUserDislikes((prev) => new Set(prev).add(messageId));
      socket.current.emit("updateLikes", {
        messageId,
        action: "dislike",
        userId,
      });
    }
  }
};

  const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const avatarTone = (name = "") => {
    const tones = ["bg-xred/15 text-xred", "bg-oteal/15 text-oteal", "bg-mustard/25 text-ink"];
    let h = 0;
    for (const ch of name) h = (h + ch.charCodeAt(0)) % tones.length;
    return tones[h];
  };

  const Avatar = ({ name, small }) => (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-display font-semibold ${avatarTone(name)} ${
        small ? "h-7 w-7 text-[13px]" : "h-10 w-10 text-[16px]"
      }`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );

  const iconBtn = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium transition-colors";

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[280px] flex-col items-start justify-center rounded-[28px] border-2 border-dashed border-line bg-card/60 p-8 sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sunk text-muted">
          <Lock className="h-5 w-5" />
        </span>
        <h3 className="font-display mt-5 text-[26px] font-medium tracking-tight">Members only, for now.</h3>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          Sign in from the top right to read and post. It keeps the spam out.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-line bg-card shadow-lift">
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
        <h3 className="font-display text-[20px] font-medium">Recent posts</h3>
        <span className="font-mono text-[12px] text-muted">
          {comments.length} {comments.length === 1 ? "post" : "posts"}
        </span>
      </div>

      <div className="max-h-[520px] space-y-1 overflow-y-auto px-3 py-3 sm:px-4" data-lenis-prevent>
        {comments.length === 0 && (
          <p className="px-3 py-10 text-center text-[15px] text-muted">Quiet table. Be the first to say something.</p>
        )}
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-2xl px-3 py-4 transition-colors hover:bg-sunk/40">
            <div className="flex items-start gap-3">
              <Avatar name={comment.username} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-[15px] font-semibold">{comment.username}</h4>
                  <span className="text-[13px] text-muted">{formatDate(comment.timestamp)}</span>
                  {comment.userId === userId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-auto rounded-full p-1.5 text-muted hover:bg-xred/10 hover:text-xred"
                      aria-label="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{comment.message}</p>

                <div className="-ml-2.5 mt-2 flex items-center gap-1">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`${iconBtn} ${userLikes.has(comment.id) ? "bg-oteal/15 text-oteal" : "text-muted hover:bg-ink/5 hover:text-ink"}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {comment.likes || 0}
                  </button>
                  <button
                    onClick={() => handleDislike(comment.id)}
                    className={`${iconBtn} ${userDislikes.has(comment.id) ? "bg-xred/15 text-xred" : "text-muted hover:bg-ink/5 hover:text-ink"}`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {comment.dislikes || 0}
                  </button>
                  <button
                    onClick={() => setShowReply((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                    className={`${iconBtn} text-muted hover:bg-ink/5 hover:text-ink`}
                  >
                    <CornerUpRight className="h-3.5 w-3.5" />
                    Reply
                  </button>
                </div>

                {showReply[comment.id] && (
                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      aria-label="Your name"
                      className="field py-2.5"
                      value={replyComment.id === comment.id ? replyComment.name : ""}
                      onChange={(e) => setReplyComment({ ...replyComment, name: e.target.value, id: comment.id })}
                    />
                    <textarea
                      className="field resize-none py-2.5"
                      rows="2"
                      placeholder="Write a reply…"
                      aria-label="Reply"
                      value={replyComment.id === comment.id ? replyComment.reply : ""}
                      onChange={(e) => setReplyComment({ ...replyComment, reply: e.target.value, id: comment.id })}
                    />
                    {error && <p className="text-[13px] text-xred">{error}</p>}
                    <button type="submit" className="btn-ink !px-4 !py-2 text-[14px]">
                      Post reply
                    </button>
                  </form>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3 border-l-2 border-line pl-4">
                    {getRepliestoShow(comment.replies, comment.id).map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5">
                        <Avatar name={reply.username} small />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="truncate text-[14px] font-semibold">{reply.username}</h5>
                            <span className="text-[12px] text-muted">{formatDate(reply.timestamp)}</span>
                            {reply.userId === userId && (
                              <button
                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                className="ml-auto rounded-full p-1 text-muted hover:bg-xred/10 hover:text-xred"
                                aria-label="Delete reply"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="mt-0.5 break-words text-[14px] leading-relaxed">{reply.reply}</p>
                        </div>
                      </div>
                    ))}

                    {comment.replies.length > INITIAL_REPLIES_SHOWN && (
                      <button
                        onClick={() => toggleRepliesExpansion(comment.id)}
                        className="flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink"
                      >
                        {expandedReplies[comment.id] ? (
                          <>
                            <ChevronUp className="h-4 w-4" /> Hide replies
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            {comment.replies.length - INITIAL_REPLIES_SHOWN}{" "}
                            {comment.replies.length - INITIAL_REPLIES_SHOWN === 1 ? "reply" : "replies"}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <form onSubmit={handleCommentSubmit} className="space-y-3 border-t border-line p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder={username ? `Name (default: ${username})` : "Name"}
            aria-label="Name"
            className="field"
            value={newComment.name}
            onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email (not shown)"
            aria-label="Email"
            className="field"
            value={newComment.email}
            onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
          />
        </div>
        <textarea
          placeholder="Say something to the table…"
          aria-label="Your post"
          className="field resize-none"
          rows="3"
          value={newComment.comment}
          onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="terms" className="flex cursor-pointer items-center gap-2 text-[14px] text-muted">
            <input
              type="checkbox"
              id="terms"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className="h-4 w-4 rounded accent-[rgb(var(--ink))]"
            />
            I'll keep it friendly
          </label>
          <button type="submit" className="btn-ink" disabled={!checked || !newComment.comment.trim()}>
            Post
          </button>
        </div>
        {error && <p className="text-[13px] text-xred">{error}</p>}
      </form>
    </div>
  );
};

export default LockedDiscussionChat;
