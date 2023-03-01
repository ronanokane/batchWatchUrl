const {addWatcher} = require('../watchUrl')

test("Throw error when url xpath not specified", ()=>{
    expect(addWatcher()).rejects.toThrow(Error)
})

  test("Throw error when no callback defined", () => {
    expect(addWatcher('dsadsad','dsadsad')).rejects.toThrow(Error);  // SUCCESS
});