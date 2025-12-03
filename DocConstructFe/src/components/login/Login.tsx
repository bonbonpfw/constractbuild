"use client";

import React from "react";
import Image from "next/image";
import { Form, Input, Button as AntButton } from "antd";
import { useRouter } from "next/router";
import styled from "styled-components";
import { login } from "../../api";
import { errorHandler, ErrorResponseData } from "../shared/ErrorHandler";
import Cookies from "js-cookie";

type LoginValues = {
  username: string;
  password: string;
};

export const GradientButton = styled(AntButton)`
  position: relative;
  border-radius: 8px;
  border-width: 2px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.1);
  background-image: linear-gradient(to bottom, #101a2c, #1c264f, #101a2c);
  padding: 8px 24px;
  font-weight: 500;
  color: #ffffff;
  box-shadow:
    0 1px 2px 0 rgba(10, 13, 18, 0.05),
    0 -2px 0 0 rgba(10, 13, 18, 0.05);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ffffff !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    background-image: linear-gradient(
      to bottom,
      #101a2c,
      #1c264f,
      #101a2c
    ) !important;
    box-shadow:
      0 1px 2px 0 rgba(10, 13, 18, 0.05),
      0 -2px 0 0 rgba(10, 13, 18, 0.05);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border-width: 2px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.1);
    opacity: 0.3;
    pointer-events: none;
  }
`;

const PageWrapper = styled.section`
  position: relative;
  display: grid;
  min-height: 100vh;
  grid-template-columns: 1fr;
  overflow: hidden;
  background-color: white;

  @media (min-width: 1024px) {
    grid-template-columns: 580px 1fr;
  }

  @media (min-width: 1536px) {
    grid-template-columns: 900px 1fr;
  }
`;
const leftWrapperStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  flexDirection: "column",
  backgroundColor: "var(--color-white)",
};

const leftInnerContainerStyle: React.CSSProperties = {
  display: "flex",
  flex: 1,
  justifyContent: "center",
  padding: "48px 32px",
  alignItems: "center",
};

const leftContentStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  flexDirection: "column",
  gap: 32,
  maxWidth: 480,
};

const logoBlockStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 48,
};

const titleBlockStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  lineHeight: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 600,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 16,
  color: "#686F7A",
};

const formWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const fieldsWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const buttonWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const RightWrapper = styled.div`
  display: none;
  position: relative;
  margin-inline: 20px;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 80px;
  overflow: hidden;
  padding-right: 30px;
  padding-left: 40px;
  background: linear-gradient(to bottom, #101a2c, #1c264f, #101a2c);

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
  }
`;

const rightInnerStyle: React.CSSProperties = {
  position: "relative",
  marginTop: 168,
  marginBottom: 168,
  marginRight: 17,
  marginLeft: 20,
  height: "100%",
  width: "100%",
  maxWidth: 660,
};

const LoginSplitMockupQuote = () => {
  const router = useRouter();
  // const { loading } = useSelector((state: RootState) => state.auth);
  // const isLoading = loading.login;

  const onFinish = async (values: LoginValues) => {
    const { username, password } = values;

    try {
      const res = await login(username, password);

      if (res?.status_code === "success" && res.token) {
        Cookies.set("auth_token", res.token, {
          path: "/",
        });

        await router.push("/projects");
      }
    } catch (error) {
      errorHandler(error as ErrorResponseData, "Failed to login");
    }
  };

  return (
    <PageWrapper>
      {/*Loading*/}

      {/* LEFT SIDE */}
      <div style={leftWrapperStyle}>
        <div style={leftInnerContainerStyle}>
          <div style={leftContentStyle}>
            <div style={logoBlockStyle}>
              <div style={{ width: 48, height: 48, cursor: "pointer" }}>
                <Image src="/logo.jpeg" alt="logo" width={48} height={48} />
              </div>
              <div style={titleBlockStyle}>
                <h1 style={titleStyle}>Log in</h1>
                <p style={subtitleStyle}>
                  Welcome back, Please enter your details.
                </p>
              </div>
            </div>

            <div style={formWrapperStyle}>
              <Form<LoginValues>
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div style={fieldsWrapperStyle}>
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                      { required: true, message: "Please enter your username" },
                      // { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input
                      type="username"
                      placeholder="Enter your Username"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      { required: true, message: "Please enter your password" },
                    ]}
                  >
                    <Input.Password placeholder="••••••••" size="large" />
                  </Form.Item>
                </div>

                <div style={buttonWrapperStyle}>
                  <GradientButton
                    htmlType="submit"
                    size="large"
                    block
                    loading={false}
                  >
                    Sign in
                  </GradientButton>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <RightWrapper>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          <Image
            src="/login/login-line-pattern.png"
            alt="bg-pattern"
            width={298}
            height={408}
          />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: 0,
          }}
        >
          <Image
            src="/login/login-line-pattern.png"
            alt="bg-pattern"
            width={298}
            height={408}
          />
        </div>

        <div style={rightInnerStyle}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Image
              src="/login/weekly-comments-chart.png"
              alt="weekly-comments-chart"
              width={474}
              height={373}
            />
          </div>

          <div
            style={{
              position: "absolute",
              right: 0,
              zIndex: 30,
              top: 112,
              maxWidth: 142,
            }}
          >
            <Image
              src="/login/state.png"
              alt="state"
              width={164}
              height={166}
            />
          </div>

          <div
            style={{
              position: "absolute",
              zIndex: 20,
              top: 220,
              right: 48,
              maxWidth: 240,
            }}
          >
            <Image
              src="/login/comments-distribution-chart.png"
              alt="comments-distribution-chart"
              width={266}
              height={352}
            />
          </div>

          <div
            style={{
              position: "absolute",
              zIndex: 20,
              top: 360,
              left: 80,
              maxWidth: 120,
            }}
          >
            <Image
              src="/login/elected-officials.png"
              alt="elected-officials"
              width={152}
              height={100}
            />
          </div>
        </div>
      </RightWrapper>
    </PageWrapper>
  );
};

export default LoginSplitMockupQuote;
