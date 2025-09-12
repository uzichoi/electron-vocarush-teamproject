import React, { useState } from "react";
import Keyboard from "react-simple-keyboard";

const CustomKeyboard = ({ focusedInput, setPlayer1, setPlayer2, setGameText, onEnter }) => {
  const [layoutName, setLayoutName] = useState("default");

  const onKeyPress = (key) => {
    let updater;
    if (focusedInput === "p1") updater = setPlayer1;
    if (focusedInput === "p2") updater = setPlayer2;
    if (focusedInput === "game") updater = setGameText;

    if (!updater) return;

    if (key === "{pre}") {
      updater((prev) => prev.slice(0, -1));
    } else if (key === "{shift}") {
      setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
    } else if (key === "{enterText}") {
      if (onEnter) onEnter();
    } else if (key === "{dot}") {
      updater((prev) => prev + ".");
    } else if (key === "{space}") {
      updater((prev) => prev + " ");
    } else {
      updater((prev) => prev + key);
    }
  };

  return (
    <div className="keyboard-wrapper">
      <Keyboard
        layoutName={layoutName}
        layout={{
          default: [
            "q w e r t y u i o p",
            "a s d f g h j k l",
            "{shift} z x c v b n m {pre}",
            "{space} {dot} {enterText}",
          ],
          shift: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "{shift} Z X C V B N M {pre}",
            "{space} {dot} {enterText}",
          ],
        }}
        onKeyPress={onKeyPress}
        display={{
          "{enterText}": "Enter",
          "{shift}": "Shift",
          "{dot}": ".",
          "{space}": "Space",
          "{pre}": "←",
        }}
      />
    </div>
  );
};

export default CustomKeyboard;
