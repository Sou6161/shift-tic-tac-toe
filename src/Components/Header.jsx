import React, { useEffect, useState } from "react";
import bgVideo from "../Videos/TestBgVideo.mp4";
import Gamelogo from "../Images/GameLogo.png";
import { Link } from "react-router-dom";
import { CornerUpRight, ThumbsDown, ThumbsUp } from "lucide-react";
import GameLauncher from "./GameLauncher";
// import { account, ID } from "../lib/appwrite";
// import { checkSession, signUp, signIn, signOut } from "../lib/auth";


const Header = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [replyComment, setReplyComment] = useState({
    id: "",
    reply: "",
  });
  const [showReply, setShowReply] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [signInView, setSignInView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const verifySession = async () => {
  //     try {
  //       const session = await checkSession();
  //       if (session) {
  //         setIsLoggedIn(true);
  //         setShowForm(false);
  //       } else {
  //         setIsLoggedIn(false);
  //       }
  //     } catch (error) {
  //       console.error("Error verifying session:", error);
  //       setIsLoggedIn(false);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   verifySession();
  // }, []);

 

  // const handleLogout = async () => {
  //   try {
  //     await signOut();
  //     setIsLoggedIn(false);
  //     setShowForm(true);
  //     setSignInView(false);
  //   } catch (error) {
  //     console.error("Error logging out:", error);
  //   }
  // };

  // const handleSubmitSignUp = async (e) => {
  //   e.preventDefault();
  //   if (password !== confirmPassword) {
  //     setError("Passwords do not match");
  //     return;
  //   }
  //   try {
  //     await signUp(email, password, name);
  //     setIsLoggedIn(true);
  //     setShowForm(false);
  //     setError(null);
  //   } catch (error) {
  //     setError(error.message);
  //   }
  // };

  // const handleSubmitSignIn = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await signIn(email, password);
  //     setIsLoggedIn(true);
  //     setShowForm(false);
  //     setError(null);
  //   } catch (error) {
  //     setError(error.message);
  //   }
  // };

  // const toggleSignIn = () => {
  //   setSignInView(true);
  //   setShowForm(true);
  // };

  // const toggleSignUp = () => {
  //   setSignInView(false);
  //   setShowForm(true);
  // };

  // // if (loading) {
  // //   return <div>Loading...</div>;
  // // }

  const handleCheckboxChange = (e) => {
    setChecked(e.target.checked);
  };

  const handleCommentChange = (e) => {
    setNewComment({ ...newComment, [e.target.name]: e.target.value });
  };

  const handleReplyChange = (e) => {
    setReplyComment({ ...replyComment, reply: e.target.value });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (
      !newComment.name ||
      !newComment.email ||
      !newComment.comment ||
      !checked
    ) {
      setError("Please fill all fields and mark the conditions.");
    } else {
      const currentTime = new Date().toLocaleTimeString();
      const currentDate = new Date().toLocaleDateString();
      setComments((prevComments) => [
        ...prevComments,
        {
          id: comments.length + 1,
          name: newComment.name,
          email: newComment.email,
          date: `${currentDate} ${currentTime}`,
          comment: newComment.comment,
          likes: 0,
          dislikes: 0,
          replies: [],
        },
      ]);
      setNewComment({
        name: "",
        email: "",
        comment: "",
      });
      setError(null);
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    const updatedComments = comments.map((comment) => {
      if (comment.id === replyComment.id) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              reply: replyComment.reply,
              date: `${currentDate} ${currentTime}`,
            },
          ],
        };
      }
      return comment;
    });
    setComments(updatedComments);
    setReplyComment({
      id: "",
      reply: "",
    });
    setShowReply(false);
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          loop
          src={bgVideo}
        ></video>
      </div>

      <div className="relative">
        <nav className="sticky w-[50vw] top-0 z-50 container mx-auto flex justify-between items-center px-2 bg-white bg-opacity-20 mt-2 rounded-full backdrop-filter backdrop-blur-lg">
          <div className="logo">
            <Link to="/">
              <img className="w-20 h-20" src={Gamelogo} alt="" />
            </Link>
          </div>
          <ul className="hidden md:flex items-center space-x-4 text-white text-lg">
            <li>
              <a href="#">Leaderboard</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
          </ul>
          {/* <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div>
                <button onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div>
                <button onClick={toggleSignIn}>Login</button>
              </div>
            )}
            {showForm && (
              <div className="absolute right-14 mt-4 top-14 bg-white p-4 rounded shadow-md w-80">
                {signInView ? (
                  <form onSubmit={handleSubmitSignIn}>
                    <h4 className="text-lg font-bold mb-4">Sign In</h4>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Sign In
                    </button>
                    <p className="text-sm text-gray-700 mt-4">
                      Don't have an account?{" "}
                      <span
                        className="text-blue-500 cursor-pointer"
                        onClick={toggleSignUp}
                      >
                        Sign Up
                      </span>
                    </p>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                  </form>
                ) : (
                  <form onSubmit={handleSubmitSignUp}>
                    <h4 className="text-lg font-bold mb-4">Sign Up</h4>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Sign Up
                    </button>
                    <p className="text-sm text-gray-700 mt-4">
                      Already have an account?{" "}
                      <span
                        className="text-blue-500 cursor-pointer"
                        onClick={toggleSignIn}
                      >
                        Sign In
                      </span>
                    </p>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                  </form>
                )}
              </div>
            )}
          </div> */}
        </nav>

        <div className="container mx-auto mt-20 pb-20">
          <div className="w-[85vw] min-h-[80vh] mx-auto rounded-xl border-[1px]  relative overflow-hidden mb-10">
            <div className="bg-gray-200 bg-opacity-30 backdrop-filter backdrop-blur-lg absolute inset-0"></div>
            <div className="relative z-10 p-8">
              <GameLauncher />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-left ml-10 relative top-[5vh] text-yellow-400 mb-[10vh]">
            About Game
          </h2>

          <p className="ml-10 text-[1.1vw] mb-[10vh]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae
            odit perspiciatis doloribus qui! Perspiciatis nobis, iusto iste
            voluptates consequuntur fugit dignissimos! Magni deleniti cum
            aperiam praesentium sit delectus hic voluptas!
          </p>

          <h2 className="text-4xl font-bold text-center text-yellow-400 mb-10">
            Unique Features
          </h2>

          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[1, 2, 3].map((box) => (
              <div
                key={box}
                className="flex-1 h-[30vh] bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-sky-200"
              >
                <h2 className="text-xl font-bold mb-2">Box {box}</h2>
                <p>
                  This is the content for Box {box}. you can add more details
                  here.
                </p>
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-bold text-center text-yellow-400 mt-[10vh] mb-10 ">
            How To Play
          </h2>

          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[1, 2, 3].map((box) => (
              <div
                key={box}
                className="flex-1 h-[30vh] bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-sky-200"
              >
                <h2 className="text-xl font-bold mb-2">Box {box}</h2>
                <p>
                  This is the content for Box {box}. You can add more details
                  here.
                </p>
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-bold text-center text-yellow-400 mt-[10vh] mb-10 ">
            Game Modes
          </h2>

          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[1, 2, 3].map((box) => (
              <div
                key={box}
                className="flex-1 h-[30vh] bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-sky-200"
              >
                <h2 className="text-xl font-bold mb-2">Box {box}</h2>
                <p>
                  This is the content for Box {box}. You can add more details
                  here.
                </p>
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-bold text-center text-yellow-400 mt-[10vh] mb-10 ">
            LeaderBoards
          </h2>

          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[1].map((box) => (
              <div
                key={box}
                className="flex-1 h-[50vh] bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-sky-200"
              >
                <h2 className="text-xl font-bold mb-2">Box {box}</h2>
                <p>
                  This is the content for Box {box}. You can add more details
                  here.
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-4xl font-bold text-center text-yellow-400 mt-[10vh] mb-10 ">
            Discussion
          </h2>

          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[1].map((box) => (
              <div
                key={box}
                className="flex-1 h-[84vh] bg-gray-00 text-white bg-opacity-30 backdrop-filter backdrop-blur-l p-2 rounded-xl bordr border-sky-200"
              >
                <div className="container mx-auto">
                  <div className=" backdrop-blur-lg rounded-lg shadow-md p-4  mb-6">
                    <div className="flex items-center">
                      <span className="font-bold text-[2vw] text-gray-700">
                        Discuss: Bounce Back
                      </span>
                      <div className="ml-auto">
                        <select className="bg-gray-700 text-white border border-gray-600 rounded py-1 px-2">
                          <option>Sort by</option>
                          <option>Newest</option>
                          <option>Oldest</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-gray-500 mb-5">
                      Comments ({comments.length})
                    </p>
                    {comments.slice(-1).map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-200 border-[1px] border-purple-600 rounded-lg shadow-md p-4 mb-6"
                      >
                        <div className="flex items-start mb-">
                          <img
                            className="h-10 w-10 rounded-full mr-4"
                            src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                            alt="User image"
                          />
                          <div>
                            <p className="font-bold text-green-800">
                              {comment.name}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {comment.date}
                            </p>
                            <p className="text-gray-800">{comment.comment}</p>
                            <span className="flex mt-2 text-gray-400">
                              {" "}
                              <CornerUpRight />
                              <p
                                className=" cursor-pointer"
                                onClick={() => setShowReply(true)}
                              >
                                Reply
                              </p>
                              <span className="flex ml-5  text-green-500">
                                <ThumbsUp />
                                <p className="ml-2">{comment.likes}</p>
                              </span>
                              <span className="flex ml-5 text-red-600 mt-1">
                                <ThumbsDown />
                                <p className="ml-2 -mt-1">{comment.dislikes}</p>
                              </span>
                            </span>
                            {showReply && (
                              <form onSubmit={handleReplySubmit}>
                                <textarea
                                  placeholder="Reply..."
                                  className="bg-gray-700 text-white border border-gray-600 rounded py-2 px-4 mb-4 w-full h-24"
                                  value={replyComment.reply}
                                  onChange={(e) =>
                                    setReplyComment({
                                      ...replyComment,
                                      reply: e.target.value,
                                      id: comment.id,
                                    })
                                  }
                                ></textarea>
                                <button
                                  type="submit"
                                  className="bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition"
                                >
                                  Reply
                                </button>
                              </form>
                            )}
                            {comment.replies.map((reply, index) => (
                              <div key={index} className="ml-10">
                                <p className="text-gray-600 text-sm">
                                  {reply.date}
                                </p>
                                <p className="text-gray-800">{reply.reply}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gray-200 border-[1px] border-purple-600 rounded-lg shadow-md p-6">
                      <h2 className="font-bold text-lg mb-4 text-gray-400">
                        Leave a Comment
                      </h2>
                      <form onSubmit={handleCommentSubmit}>
                        <input
                          type="text"
                          placeholder="Name . . ."
                          className="bg-gray-700 text-white border border-gray-600 rounded py-2 px-4 mb-4 w-full"
                          value={newComment.name}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              name: e.target.value,
                            })
                          }
                        />
                        <input
                          type="email"
                          placeholder="Email . . ."
                          className="bg-gray-700 text-white border border-gray-600 rounded py-2 px-4 mb-4 w-full"
                          value={newComment.email}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              email: e.target.value,
                            })
                          }
                        />
                        <textarea
                          placeholder="Content . . ."
                          className="bg-gray-700 text-white border border-gray-600 rounded py-2 px-4 mb-4 w-full h-24"
                          value={newComment.comment}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              comment: e.target.value,
                            })
                          }
                        ></textarea>
                        <label className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            className="text-blue-600 border-gray-600 rounded mr-2"
                            checked={checked}
                            onChange={handleCheckboxChange}
                          />
                          <span className="text-gray-500">
                            I’d read and agree to the terms and conditions.
                          </span>
                        </label>
                        {error ? (
                          <p className="text-red-600 text-sm">{error}</p>
                        ) : null}
                        <button
                          type="submit"
                          className="bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition"
                          disabled={
                            !checked ||
                            !newComment.name ||
                            !newComment.email ||
                            !newComment.comment
                          }
                        >
                          Comment
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-bold text-left ml-5 text-yellow-400 mt-[10vh] mb-10 ">
            Game Updates
          </h2>
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[1].map((box) => (
              <div
                key={box}
                className="flex-1 h-[40vh] bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-sky-200"
              >
                <h2 className="text-xl font-semibold mb-[5vh] flex ">
                  {"1.)"}{" "}
                  <p className="ml-2">
                    This is the content for Box {box}. You can add more details
                    here.
                  </p>
                </h2>
                <h2 className="text-xl font-semibold mb-[5vh] flex ">
                  {"2.)"}{" "}
                  <p className="ml-2">
                    This is the content for Box {box}. You can add more details
                    here.
                  </p>
                </h2>
                <h2 className="text-xl font-semibold mb-[5vh] flex ">
                  {"3.)"}{" "}
                  <p className="ml-2">
                    This is the content for Box {box}. You can add more details
                    here.
                  </p>
                </h2>
                <h2 className="text-xl font-semibold flex ">
                  {"4.)"}{" "}
                  <p className="ml-2">
                    This is the content for Box {box}. You can add more details
                    here.
                  </p>
                </h2>
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-bold text-left ml-5 text-yellow-400 mt-[10vh] mb-10 ">
            About Developer
          </h2>
          <p className="ml-5">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quam magni
            nemo blanditiis provident voluptatibus. Rem asperiores iure deleniti
            sequi est esse voluptates quas, quos, eligendi vol
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
