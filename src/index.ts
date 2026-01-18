export async function init() {
  miro.board.ui.on("icon:click", async () => {
    await miro.board.ui.openPanel({ url: "app.html" });
  });

  // experimental: jumping
  // const handleJumpToPanel = async () => {
  //   const selection = await miro.board.getSelection();
  //   if (selection.length === 1 && selection[0].type === 'sticky_note') {
  //     const noteId = selection[0].id;
  //     const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
  //     if (noteElement instanceof HTMLElement) {
  //       noteElement.focus();
  //       //screenReaderMessage('Returned to note in panel');
  //     }
  //   }
  // };

  // // Subscribe to the custom event
  // await miro.board.ui.on('custom:jump-to-panel', handleJumpToPanel);

  // // Register the custom action
  // await miro.board.experimental.action.register({
  //   event: 'jump-to-panel',
  //   ui: {
  //     label: {
  //       en: 'Jump to Panel Note',
  //     },
  //     icon: 'arrow-left',
  //     description: 'Jump back to the corresponding note in the panel',
  //   },
  //   scope: 'local',
  //   predicate: {
  //     type: 'sticky_note'
  //   },
  //   contexts: {
  //     item: {}
  //   },
  //   selection: 'single' // Only show when a single note is selected
  // });
}

init();
