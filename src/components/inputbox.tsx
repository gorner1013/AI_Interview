import { IconButton } from "./iconButton";

type Props = {
  userMessage: string;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClickSendButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const Inputbox = ({
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
    <div className="absolute bottom-0 z-20 w-screen">
      <div className="bg-base text-black">
        <div className="mx-auto max-w-4xl p-16">
          <div className="grid grid-flow-col gap-[8px] grid-cols-[1fr_min-content]">
            <textarea
              rows={10}
              placeholder="メッセージを入力してください。"
              onChange={onChangeUserMessage}
              onKeyPress={onKeyPress}
              disabled={isChatProcessing}
              className="resize-none bg-surface1 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled rounded-16 w-full px-16 text-text-primary typography-16 font-M_PLUS_2 font-bold disabled"
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
