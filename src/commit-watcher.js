// TODO: remove before release
export function watchLatestCommit() {
  if (isLocalEnvironment()) {
    return;
  }

  const url = "commit.json";
  let current;

  async function watch() {
    const res = await fetch(url, { method: "GET" });
    const json = res.json();

    current = current ?? json.sha;
    if (current === json.sha) {
      return;
    }

    Modal.message.show(
      "Refresh the page (game will be saved), we've got new stuff: "
      + `"${json.message}" by ${json.author}`,
      {
        callback: updateRefresh,
        closeButton: true,
      },
      3,
    );
  }

  // oxlint-disable-next-line prefer-await-to-callbacks
  setInterval(() => watch().catch((/** @type {unknown} */ err) => {
    console.err(err);
  }), 60000);
}
