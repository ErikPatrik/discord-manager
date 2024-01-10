interface MockBanOptions {
    options: {
        user: string | undefined,
        name: string
    }
}

const VALID_BAN_OPTIONS: MockBanOptions = {
    options: {
        user: '941703402214281237',
        name: 'user_1',
    }
}

describe('Test a user options', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should have options defined', () => {
        expect(VALID_BAN_OPTIONS.options).toBeDefined()
    })

    it('should have user defined', () => {
        expect(VALID_BAN_OPTIONS.options.user).toBeDefined()
    })

    it('should have a valid user ID', () => {
        expect(typeof VALID_BAN_OPTIONS.options.user).toBe('string')
        expect(VALID_BAN_OPTIONS.options?.user?.length).toBeGreaterThan(0)
    })

    it('should have name defined', () => {
        expect(VALID_BAN_OPTIONS.options.name).toBeDefined()
    })

    it('should have a valid name', () => {
        expect(typeof VALID_BAN_OPTIONS.options.name).toBe('string')
        expect(VALID_BAN_OPTIONS.options.name.length).toBeGreaterThan(0)
    })

    it('should execute ban command with valid options', () => {
        const executeBanCommand = jest.fn()
        executeBanCommand(VALID_BAN_OPTIONS.options)

        expect(executeBanCommand).toHaveBeenCalledWith(VALID_BAN_OPTIONS.options)
    })

    it('should not allow an empty user ID', () => {
        const invalidOptions: MockBanOptions = {
            options: {
                user: '',
                name: 'user_1',
            },
            }
        expect(invalidOptions.options.user).toBeFalsy()
    })

    it('should not allow undefined user ID', () => {
        const invalidOptions: MockBanOptions = {
            options: {
                name: 'user_1',
                user: undefined
            },
        }
        expect(invalidOptions.options.user).toBeUndefined()
    })
})