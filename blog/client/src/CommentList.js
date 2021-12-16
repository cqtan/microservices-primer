import React from "react";

const CommentList = ({ comments }) => {
  // Not needed anymore since we get data from Query service
  // const [comments, setComments] = useState([]);

  // const fetchData = async () => {
  //   const res = await axios.get(
  //     `http://localhost:4001/posts/${postId}/comments`
  //   );

  //   setComments(res.data);
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const renderedComments = comments.map((comment) => {
    let content = "";
    if (comment.status === "approved") {
      content = comment.content;
    }

    if (comment.status === "rejected") {
      content = "This comment has been rejected";
    }

    if (comment.status === "pending") {
      content = "This comment is awaiting moderation";
    }

    return <li key={comment.id}>{content}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
