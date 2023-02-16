const {addWatcher} = require('../watchUrl')

test("Throw error when url xpath not specified", ()=>{
    expect(addWatcher()).rejects.toThrow(Error)
})

test('Method should throw Error', () => {
    expect(addWatcher('dsadsad','dsadsad')).not.resolved.toThrow(Error);  // SUCCESS
});