async function test() {
  const m = await import('react-joyride');
  console.log("Exports:", Object.keys(m));
}
test();
