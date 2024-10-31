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
      socket.current = io("http://localhost:8080");

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

  const LockedState = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 bg-opacity-90 rounded-xl p-8">
      <Lock className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-4">
        Discussion Chat Locked
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Please sign in or sign up to participate in the discussion
      </p>
    </div>
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
      <div className="flex-1 h-[84vh] bg-gray-100 bg-opacity-30 backdrop-filter backdrop-blur-lg p-4 rounded-xl border border-sky-200 overflow-y-auto">
        {!isAuthenticated ? (
          <LockedState />
        ) : (
          <div className="container mx-auto">
            <div className="rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-700">
                  Discussion Chat
                </h2>
                <p className="ml-4 text-gray-500">
                  ({comments.length} comments)
                </p>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <div className="flex items-start">
                      <img
                        src="https://simg.nicepng.com/png/small/122-1228864_bronson-xerri-player-profile-silhouette.png"
                        alt="avatar"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <h3 className="font-bold text-gray-800">
                              {comment.username}
                            </h3>
                            <span className="ml-2 text-sm text-gray-500">
                              {formatDate(comment.timestamp)}
                            </span>
                          </div>
                          {comment.userId === userId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{comment.message}</p>

                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(comment.id)}
                            className={`flex items-center ${
                              userLikes.has(comment.id)
                                ? "text-blue-500"
                                : "text-gray-500 hover:text-blue-500"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button
                            onClick={() => handleDislike(comment.id)}
                            className={`flex items-center ${
                              userDislikes.has(comment.id)
                                ? "text-red-500"
                                : "text-gray-500 hover:text-red-500"
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            <span>{comment.dislikes || 0}</span>
                          </button>
                          <button
                            onClick={() =>
                              setShowReply((prev) => ({
                                ...prev,
                                [comment.id]: !prev[comment.id],
                              }))
                            }
                            className="flex items-center text-gray-500 hover:text-blue-500"
                          >
                            <CornerUpRight className="w-4 h-4 mr-1" />
                            <span>Reply</span>
                          </button>
                        </div>

                        {showReply[comment.id] && (
                          <form
                            onSubmit={(e) => handleReplySubmit(e, comment.id)}
                            className="mt-3 space-y-3"
                          >
                            <input
                              type="text"
                              placeholder="Your name"
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={
                                replyComment.id === comment.id
                                  ? replyComment.name
                                  : ""
                              }
                              onChange={(e) =>
                                setReplyComment({
                                  ...replyComment,
                                  name: e.target.value,
                                  id: comment.id,
                                })
                              }
                            />
                            <textarea
                              className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Write a reply..."
                              value={
                                replyComment.id === comment.id
                                  ? replyComment.reply
                                  : ""
                              }
                              onChange={(e) =>
                                setReplyComment({
                                  ...replyComment,
                                  reply: e.target.value,
                                  id: comment.id,
                                })
                              }
                            />
                            {error && (
                              <p className="text-red-500 text-sm">{error}</p>
                            )}
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              Post Reply
                            </button>
                          </form>
                        )}

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 mt-4 space-y-3">
                            {getRepliestoShow(comment.replies, comment.id).map(
                              (reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                      <h4 className="font-bold text-gray-800">
                                        {reply.username}
                                      </h4>
                                      <span className="ml-2 text-sm text-gray-500">
                                        {formatDate(reply.timestamp)}
                                      </span>
                                    </div>
                                    {reply.userId === userId && (
                                      <button
                                        onClick={() =>
                                          handleDeleteReply(
                                            comment.id,
                                            reply.id
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-gray-700">{reply.reply}</p>
                                </div>
                              )
                            )}

                            {comment.replies.length > INITIAL_REPLIES_SHOWN && (
                              <button
                                onClick={() =>
                                  toggleRepliesExpansion(comment.id)
                                }
                                className="flex items-center text-blue-500 hover:text-blue-700 mt-2 text-sm font-medium"
                              >
                                {expandedReplies[comment.id] ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Show less replies
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    View{" "}
                                    {comment.replies.length -
                                      INITIAL_REPLIES_SHOWN}{" "}
                                    more{" "}
                                    {comment.replies.length -
                                      INITIAL_REPLIES_SHOWN ===
                                    1
                                      ? "reply"
                                      : "replies"}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-white rounded-lg shadow p-4">
                <h3 className="text-xl font-bold text-gray-700 mb-4">
                  Leave a Comment
                </h3>
                <form onSubmit={handleCommentSubmit}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full p-2 border rounded-lg"
                      value={newComment.name}
                      onChange={(e) =>
                        setNewComment({ ...newComment, name: e.target.value })
                      }
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full p-2 border rounded-lg"
                      value={newComment.email}
                      onChange={(e) =>
                        setNewComment({ ...newComment, email: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="Your comment"
                      className="w-full p-2 border rounded-lg resize-none"
                      rows="4"
                      value={newComment.comment}
                      onChange={(e) =>
                        setNewComment({
                          ...newComment,
                          comment: e.target.value,
                        })
                      }
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                        className="mr-2"
                      />
                      <label htmlFor="terms" className="text-gray-600">
                        I agree to the terms and conditions
                      </label>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      disabled={!checked || !newComment.comment.trim()}
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LockedDiscussionChat;
