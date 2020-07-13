import React, { Component } from "react";
const $ = window.$;
export default class CircleAndArrow extends Component {
  render() {
    this.circleAndArrowScript(this);
    return (
      <div>
        <svg
          id="mouseArrorwSVG"
          style={{
            zIndex: 99999,
            width: this.props.boardsize + "px",
            height: "100%",
            position: "fixed",
            top: 0,
            pointerEvents: "none"
          }}
        />
        <div id="circle-and-line-template" style={{ display: "none" }}>
          <svg>
            <defs>
              <marker
                id="markerItem"
                orient="auto"
                markerWidth="4"
                markerHeight="8"
                refX="2.05"
                refY="2.01"
              >
                <path d="M0,0 V4 L3,2 Z" fill="#15781B" />
              </marker>
            </defs>
            <line
              id="lineItem"
              stroke="#15781B"
              strokeWidth="9.0625"
              strokeLinecap="round"
              markerEnd="url(#markerItem)"
              opacity="1"
              x1="0"
              y1="0"
              x2="0"
              y2="0"
            />
            <circle
              id="circleItem"
              stroke="#15781B"
              strokeWidth="3.625"
              fill="none"
              opacity="1"
              cx="0"
              cy="0"
              r="0"
            />
          </svg>
        </div>
      </div>
    );
  }
  circleAndArrowScript(currentObject) {
    var currentClick = 0;
    var handleMouseMove = false;
    var currentElementId = "";
    var errorXAdjustment = 15;
    var handledRightClick = false;
    var color = "#15781B";
    //below is the code for showing and hiding arrows
    $("#" + currentObject.props.chardBoardName).mousedown(function(ev) {
      if (ev.which == 3) {
        if (handledRightClick) {
          return;
        }
        handledRightClick = true;
        var target = ev.target;
        //
        if (!$(ev.target).attr(currentObject.props.squareId)) {
          target = $(ev.target).closest("[" + currentObject.props.squareId + "]");
        }
        currentElementId = $(target).attr(currentObject.props.squareId);
        currentClick++;
        var html = $("#circle-and-line-template svg").html();
        html = html.replace(/markerItem/g, "markerItem-" + currentClick);
        html = html.replace("lineItem", "lineItem-" + currentClick);
        html = html.replace("circleItem", "circleItem-" + currentClick);
        $("#mouseArrorwSVG").append(currentObject.parseSVG(html));
        $("#lineItem-" + currentClick).hide();
        $("#markerItem-" + currentClick + " path").attr("fill", color);
        $("#lineItem-" + currentClick).attr("stroke", color);
        $("#lineItem-" + currentClick).attr(
          "x1",
          $(target).position().left + $(target).width() / 2 - errorXAdjustment
        );
        $("#lineItem-" + currentClick).attr(
          "y1",
          $(target).position().top + $(target).height() / 2
        );
        $("#lineItem-" + currentClick).attr("stroke-width", $(target).width() / 7);
        $("#lineItem-" + currentClick).attr("source-element", currentElementId);

        $("#circleItem-" + currentClick).attr("stroke", color);
        $("#circleItem-" + currentClick).attr(
          "cx",
          $(target).position().left + $(target).width() / 2 - errorXAdjustment
        );
        $("#circleItem-" + currentClick).attr(
          "cy",
          $(target).position().top + $(target).height() / 2
        );
        $("#circleItem-" + currentClick).attr("r", $(target).width() / 2 - 1);
        $("#circleItem-" + currentClick).attr("stroke-width", $(target).width() / 15);

        $("#lineItem-" + currentClick).attr("x2", ev.pageX);
        $("#lineItem-" + currentClick).attr("y2", ev.pageY);

        handleMouseMove = true;
        return false;
      }
    });

    $(document).mouseup(function(event) {
      handleMouseMove = false;
      handledRightClick = false;
      if (event.which !== 3) {
        currentClick = 0;
        handleMouseMove = false;
        currentElementId = "";
        $("#mouseArrorwSVG").empty();
      }
    });

    $("#" + currentObject.props.chardBoardName).mousemove(function(event) {
      if (handleMouseMove == true) {
        var target = event.target;
        if (!$(event.target).attr(currentObject.props.squareId)) {
          target = $(event.target).closest("[" + currentObject.props.squareId + "]");
        }
        if ($(target).attr(currentObject.props.squareId) != currentElementId) {
          $("#lineItem-" + currentClick).show();
          var msg = "Handler for .mousemove() called at ";
          msg += event.pageX + ", " + event.pageY;
          $("#lineItem-" + currentClick).attr(
            "x2",
            $(target).position().left + $(target).width() / 2 - errorXAdjustment
          );
          $("#lineItem-" + currentClick).attr(
            "y2",
            $(target).position().top + $(target).height() / 2
          );
          $("#lineItem-" + currentClick).attr("target-element", currentElementId);
        }
      }
    });

    $(document).on("contextmenu", function(event) {
      event.preventDefault();
    });
    $("body").keydown(function(event) {
      if (event.altKey || event.shiftKey || event.ctrlKey) {
        if (event.altKey && event.shiftKey) {
          color = "red";
        } else if (event.altKey && event.ctrlKey) {
          color = "yellow";
        } else if (event.altKey) {
          color = "green";
        }
      }
    });
  }
  parseSVG(s) {
    var div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
    var frag = document.createDocumentFragment();
    while (div.firstChild.firstChild) frag.appendChild(div.firstChild.firstChild);
    return frag;
  }
}
