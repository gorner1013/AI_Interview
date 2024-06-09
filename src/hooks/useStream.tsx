import { useEffect, useState } from "react";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
// hooks
import { usePub } from "@/hooks/usePubSub";
// constants
import { PUB_SUB_EVENT } from "@/features/constants/pubSubEvent";

/** Stream関連のログPrefix */
const LOG_PREFIX = "【Stream】";

export const useStream = () => {
  const [userStream, setUserStream] = useState<MediaStream>();
  const [displayStream, setDisplayStream] = useState<MediaStream>();
  const promises = [];

  const publish = usePub();

  useEffect(() => {
    console.debug(`${LOG_PREFIX} Start useStream acquisition process.`);
    getStream();
    return () => {
      setUserStream(null);
      setDisplayStream(null);
    };
  }, []);

  const getStream = () => {
    if (isBrowser) {
      promises.push(navigator.mediaDevices.getUserMedia({ audio: true }));
      // If you need video as well, uncomment the following line:
      // promises.push(navigator.mediaDevices.getUserMedia({ video: true, audio: true }));
      promises.push(
        navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "monitor" },
          audio: true,
        })
      );
    }

    if (isMobile) {
      promises.push(navigator.mediaDevices.getUserMedia({ audio: true }));
      promises.push(
        navigator.mediaDevices.getUserMedia({
          video: { width: 427, height: 240 },
          audio: true,
        })
      );
    }
    console.debug(`${LOG_PREFIX} Start stream acquisition process.`);
    Promise.all(promises)
      .then((results) => {
        if (isBrowser) {
          if (results[1].getAudioTracks().length < 1)
            throw new Error("Display audio is not allowed.");
          console.log("isBrowser");
          setUserStream(results[0]);
          setDisplayStream(results[1]);
          console.log("results[0]", results[0]);
          console.log("results[1]", results[1]);
        }
        // ディスプレイのシステム音声が許可されているか確認
        if (isMobile) {
          setUserStream(results[0]);
          setDisplayStream(results[1]);
		  console.log("isMobile");
        }

        // setDisplayStream(results[1]);
        console.debug(`${LOG_PREFIX} Stream acquisition process completed.`);
      })
      .catch((err) => {
        console.debug(`${LOG_PREFIX} Could not get stream.`);
        console.error(err);
        alert("画面共有とシステム音声の共有を許可してください。");
        location.reload();
      });
  };

  return {
    userStream,
    displayStream,
  };
};
