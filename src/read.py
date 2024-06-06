import os


def display_ts_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            print(f"File: {file_path}")
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                print(content)
            print()


# 使用例
directory = "."  # 現在のディレクトリを指定。必要に応じてパスを変更してください。
display_ts_files(directory)
