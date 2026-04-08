import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { Crepe } from "@milkdown/crepe";
import {
  Milkdown,
  MilkdownProvider,
  useEditor,
  useInstance,
} from "@milkdown/react";
import { getMarkdown } from "@milkdown/kit/utils";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord-dark.css";
import "./milkdown-overrides.css";
import { useFetchBe } from "../../../tools/api";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Node } from "../../../types/node.types";

export interface NodeTextProps {
  node: Node;
  refetch?: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Node, Error>>;
}

const CrepeEditor: React.FC<{
  defaultValue: string;
  onReady?: (getContent: () => string) => void;
}> = ({ defaultValue, onReady }) => {
  const { get } = useEditor((root) => {
    return new Crepe({
      root,
      features: {
        [Crepe.Feature.ImageBlock]: false,
      },
      defaultValue,
    });
  });

  const [, getInstance] = useInstance();

  useEffect(() => {
    if (onReady) {
      onReady(() => {
        const editor = getInstance();
        if (!editor) return defaultValue;
        return editor.action(getMarkdown());
      });
    }
  }, [getInstance, onReady, defaultValue]);

  return <Milkdown />;
};

const NodeText: React.FC<NodeTextProps> = ({ node, refetch }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fetchBe = useFetchBe();

  const [title, setTitle] = useState(node.data?.title || "");
  const getContentRef = React.useRef<(() => string) | null>(null);

  useEffect(() => {
    setTitle(node.data?.title || "");
  }, [node.data?.title]);

  const handleEditorReady = useCallback((getContent: () => string) => {
    getContentRef.current = getContent;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = getContentRef.current
        ? getContentRef.current()
        : node.data?.description || "";
      await fetchBe(`/v1/nodes/${node.id}`, {
        method: "PATCH",
        body: {
          commentPermitted: node.commentPermitted,
          data: {
            ...node.data,
            title,
            description: content,
          },
          order: node.order,
        },
      });
      setEditing(false);
      refetch && (await refetch());
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(node.data?.title || "");
    setEditing(false);
  };

  return (
    <Box my={2}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {editing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontWeight: 600,
              fontSize: 16,
              padding: 4,
              minWidth: 180,
            }}
            placeholder="제목을 입력하세요"
            disabled={saving}
          />
        ) : (
          <>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {node.data?.title || "텍스트 노드"}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setEditing(true)}
              sx={{ ml: 1 }}
            >
              수정
            </Button>
          </>
        )}
      </Box>
      {editing ? (
        <Box>
          <MilkdownProvider>
            <CrepeEditor
              defaultValue={node.data?.description || ""}
              onReady={handleEditorReady}
            />
          </MilkdownProvider>
          <Box display="flex" gap={1} mt={1}>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              size="small"
            >
              {saving ? "저장 중..." : "저장"}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outlined"
              size="small"
            >
              취소
            </Button>
          </Box>
        </Box>
      ) : (
        <Box mb={1}>
          <ReactMarkdown>{node.data?.description || ""}</ReactMarkdown>
        </Box>
      )}
    </Box>
  );
};

export default NodeText;
