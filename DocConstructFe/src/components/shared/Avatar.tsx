import React from "react";
import styled from "styled-components";

type AvatarProps = {
  name: string;
  /** Diameter in pixels (optional, default 32) */
  size?: number;
  className?: string;
};

const AvatarCircle = styled.div<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background-color: ${(p) => p.theme.colors.accent};
  color: #ffffff;
  font-weight: 600;
  font-size: ${(p) => Math.max(12, p.$size * 0.5)}px;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const Avatar: React.FC<AvatarProps> = ({ name, size = 32, className }) => {
  const trimmed = name?.trim() ?? "";
  const initial = trimmed ? trimmed[0].toUpperCase() : "?";

  return (
    <AvatarCircle
      title={name}
      $size={size}
      className={className}
      aria-label={trimmed || "Unknown user"}
    >
      {initial}
    </AvatarCircle>
  );
};

export default Avatar;
