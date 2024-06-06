import { IconButton } from "./iconButton";

type Props = {
  userMessage: string;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClickSendButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const Fulltext = ({
  userMessage,
  isChatProcessing,
  onChangeUserMessage,
  onClickSendButton,
}: Props) => {
  const onKeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      onClickSendButton(e);
      e.preventDefault();
    }
  };

  return (
    <div className="absolute bottom-0 z-20 w-screen h-screen">
      <div className="bg-base text-black h-full">
        <div className="mx-auto p-16 h-full">
          <div className="h-full grid grid-flow-col gap-[8px] grid-cols-[1fr_min-content]">
            <textarea
              placeholder="メッセージを入力してください。"
              onChange={onChangeUserMessage}
              disabled={isChatProcessing}
              onKeyPress={onKeyPress}
              className="resize-none h-full bg-surface1 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled rounded-16 w-full px-16 text-text-primary typography-16 font-M_PLUS_2 font-bold disabled"
              value={userMessage}
            ></textarea>
            <div className="">
              <IconButton
                iconName="24/Send"
                className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={isChatProcessing}
                disabled={isChatProcessing || !userMessage}
                onClick={onClickSendButton}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
