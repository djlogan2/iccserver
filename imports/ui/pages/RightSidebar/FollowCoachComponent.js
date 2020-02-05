import React, { Component } from "react";
/**
 * 
 * 
Now this display html code so we created functional component this component will be feature enhancement 

 */

const FollowCoachComponent = () => (
  <div>
    <div style={{ padding: "20px", overflowX: "scroll", height: "45vh" }}>
      <div
        style={{
          width: "65px",
          float: "left"
        }}
      >
        <img src="images/user.png" style={{ width: "60px" }} />
      </div>
      <div
        style={{
          width: "78%",
          float: "left",
          marginLeft: "10px"
        }}
      >
        <div
          style={{
            width: "100%",
            float: "left"
          }}
        >
          <div
            style={{
              width: "40%",
              float: "left"
            }}
          >
            Mike
          </div>
          <div
            style={{
              marginLeft: "15px"
            }}
          >
            Location | Rating 215
          </div>

          <div
            style={{
              width: "100%",
              float: "left",
              marginTop: "10px",
              fontSize: "14px",
              lineHeight: "20px"
            }}
          >
            {" "}
            the leap into electronic typesetting, remaining essentially unchanged. It was
            popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
            accident, sometimes on purpose (injected humour and the like).
          </div>
          <div
            style={{
              width: "100%",
              float: "left",
              marginTop: "10px"
            }}
          >
            <div style={{ width: "50%", float: "left" }}>
              <img src="images/mail.png" style={{ width: "25px",
    marginRight: "10px"}}/>
              Send Message
            </div>
            <div style={{ width: "40%", float: "left", marginLeft: "20px" }}>
              <img src="images/followers.png" style={{ width: "25px",
    marginRight: "10px"}} />
              Follow
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
export default FollowCoachComponent;
