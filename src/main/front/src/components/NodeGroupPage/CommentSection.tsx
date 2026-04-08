import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  TextField,
  Button,
} from "@mui/material";
import { useFetchBe } from "../../tools/api";
import { usePostComment } from "../../utils/usePostComment";

const categoryEmojiMap: Record<string, string> = {
  질문: "❓",
  피드백: "😁",
  열정: "🔥",
  감사: "☺️",
  칭찬: "🌟",
};

const labelToCategoryId: Record<string, string> = {
  질문: "cate0000000000000000000000000001",
  피드백: "cate0000000000000000000000000002",
  열정: "cate0000000000000000000000000003",
  감사: "cate0000000000000000000000000004",
  칭찬: "cate0000000000000000000000000005",
};

interface Comment {
  id: string;
  targetId: string;
  userName: string;
  content: string;
  categoryId: string;
  createdAt: string;
}

interface Props {
  nodeId: string;
  // onSubmit: (newComment: Comment) => void;
}

const CommentSection: React.FC<Props> = ({ nodeId }) => {
  const fetchBe = useFetchBe();
  // const postComment = usePostComment();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newCategory, setNewCategory] =
    useState<keyof typeof categoryEmojiMap>("질문");
  const [newContent, setNewContent] = useState("");
  const { mutateAsync: postComment } = usePostComment();
  const loadComments = async () => {
    try {
      const all = await fetchBe(`/v1/comments/search?nodeGroupId=${nodeId}`);
      const filtered = Array.isArray(all) ? all.filter((c: Comment) => c.targetId === nodeId) : [];
      setComments(filtered);
    } catch (err) {
      console.error("❌ 댓글 로딩 실패", err);
    }
  };
  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    try {
      await postComment({
        content: newContent,
        categoryId: labelToCategoryId[newCategory],
        targetId: nodeId,
      });

      setNewContent("");
      loadComments();
    } catch (err) {
      console.log(err);
      alert("❌ 댓글 등록 실패!!");
    }
  };

  useEffect(() => {
    loadComments();
  }, [nodeId]);

  const categoryCounts: Record<string, number> = {};
  comments.forEach((comment) => {
    const label = Object.entries(labelToCategoryId).find(
      ([_, id]) => id === comment.categoryId
    )?.[0];
    if (label && categoryEmojiMap[label]) {
      categoryCounts[label] = (categoryCounts[label] || 0) + 1;
    }
  });

  return (
    <Box
      mt={2}
      bgcolor="#f0f0f0ed"
      border="1px solid #ddd"
      borderRadius={2}
      p={2}
      height="100%"
      boxShadow={1}
      overflow="auto"
      sx={
        {
          // transition: "background-color 0.5s",
          // "&:hover": { backgroundColor: "#fff" },
        }
      }
    >
      {/* 1. 이모지 카운트 표시 */}
      <Box display="flex" gap={2} mb={2} justifyContent="end">
        {Object.entries(categoryEmojiMap).map(([category, emoji]) => (
          <Box key={category} display="flex" alignItems="center" gap={0.5}>
            <Typography fontSize={20}>{emoji}</Typography>
            <Typography fontSize={14} color="gray">
              {categoryCounts[category] || 0}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 2. 댓글 입력 영역 */}
      <Box display="flex" gap={1} alignItems="center" mb={2} color="black">
        <Select
          value={newCategory}
          size="small"
          onChange={(e) =>
            setNewCategory(e.target.value as keyof typeof categoryEmojiMap)
          }
          sx={{
            color: "white",
            backgroundColor: "#23243a",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#999",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#23243a",
            },
          }}
        >
          {Object.keys(categoryEmojiMap).map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
        <TextField
          placeholder="댓글을 입력하세요"
          size="small"
          fullWidth
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          sx={{
            input: { color: "#23243a" },
            backgroundColor: "#f9f9f9",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#999",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#23243a",
            },
          }}
        />
        <Button
          variant="outlined"
          onClick={handleSubmit}
          sx={{
            color: "#23243a",
            borderColor: "#23243a",
            "&:hover": {
              borderColor: "#23243a",
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          등록
        </Button>
      </Box>

      {/* 3. 기존 댓글 목록 */}
      {comments.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={100}
        >
          <Typography color="gray" fontSize={14}>
            (처음으로 댓글을 남겨보세요)
          </Typography>
        </Box>
      ) : (
        comments.map((c, i) => (
          <Box key={i} mb={1}>
            <Typography color="black" fontSize={14} fontWeight={600}>
              {/* {c.author.name} ({c.category}) */}
            </Typography>
            <Typography color="black" fontSize={14}>
              {c.content}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

export default CommentSection;
