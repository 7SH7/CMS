import React from "react";
import ReactMarkdown from "react-markdown";
import { Box, Typography, Link as MuiLink } from "@mui/material";

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <Box
      p={2}
      borderRadius={2}
      sx={{ overflow: "auto", maxHeight: "100%", width: "100%" }}
    >
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <Typography
              variant="h4"
              sx={{ my: 3, fontWeight: "bolder" }}
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <Typography
              variant="h5"
              sx={{ my: 3, fontWeight: "bolder" }}
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <Typography
              variant="h6"
              sx={{ my: 3, fontWeight: "bolder" }}
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.75, wordBreak: "keep-all" }}
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li>
              <Typography component="span" variant="body1" {...props} />
            </li>
          ),
          a: ({ href, children, ...props }) => (
            <MuiLink
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </MuiLink>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <Box
                  component="code"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: "0.875em",
                    fontFamily: "monospace",
                  }}
                  {...props}
                >
                  {children}
                </Box>
              );
            }
            return (
              <Box
                component="pre"
                sx={{
                  bgcolor: "rgba(0,0,0,0.3)",
                  p: 2,
                  borderRadius: 1,
                  overflow: "auto",
                  my: 2,
                }}
              >
                <code className={className} {...props}>
                  {children}
                </code>
              </Box>
            );
          },
          blockquote: ({ children, ...props }) => (
            <Box
              component="blockquote"
              sx={{
                borderLeft: "4px solid rgba(255,255,255,0.3)",
                pl: 2,
                ml: 0,
                my: 2,
                color: "text.secondary",
              }}
              {...props}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownViewer;
