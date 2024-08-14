/**
 * Copyright (c) 2024 Cisco Systems, Inc. and its affiliates
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http:www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { FC } from "react";
import { Button as AntDButton } from "antd";
import cx from "classnames";

import { ButtonVariants } from "@/common/enum";

import styles from "./button.module.scss";

interface PrimaryButtonProps {
  text: string;
  onClick: () => void;
  variant: ButtonVariants.PRIMARY;
  customClass?: string;
  iconSrc?: string;
}

interface SecondaryButtonProps {
  text: string;
  onClick: () => void;
  variant: ButtonVariants.SECONDARY;
  customClass?: string;
  iconSrc?: string;
}

interface TertiaryButtonProps {
  onClick: () => void;
  variant: ButtonVariants.TERTIARY;
  iconSrc?: string;
  customClass?: string;
  text?: string;
}

type ButtonProps = PrimaryButtonProps | SecondaryButtonProps | TertiaryButtonProps;

export const Button: FC<ButtonProps> = ({ onClick, text, iconSrc }) => {
  return (
    <AntDButton
      onClick={onClick}
      style={{
        backgroundColor: '#1890ff', // Blue background
        color: 'white', // White text
        padding: '10px 20px', // Padding around text
        borderRadius: '5px', // Rounded corners
        border: 'none', // No border
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Subtle shadow
        transition: 'all 0.3s', // Smooth transition for hover effect
        marginTop: '20px', // Add space between buttons
        marginBottom: '20px', // Add space between buttons
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} // Slightly enlarge on hover
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} // Return to original size
    >
      <span>{text}</span>
      {iconSrc && <img src={iconSrc} alt={text} style={{ marginLeft: '10px' }} />}
    </AntDButton>
  );
};
