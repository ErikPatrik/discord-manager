describe('Test getSpecificGuild', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    interface MockGuild {
        id: string
    }

    const mockGuild: MockGuild = { id: '1184648284699099286' }
    const VALID_GUILD_ID = '1184648284699099286'

    const mockClient = {
        guilds: {
            fetch: jest.fn().mockImplementation((guildId) => {
                if (guildId === VALID_GUILD_ID) {
                    return Promise.resolve(mockGuild)
                } else {
                    return Promise.reject(new Error('Guild not found'))
                }
            }),
        },
    }

    it(`should return the guild object if the guild does exist.`, async () => {
        expect(await getSpecificGuild(VALID_GUILD_ID, mockClient)).toBe(mockGuild)
    })

    it(`should return false if the guild doesn't exist.`, async () => {
        expect(await getSpecificGuild('111111111111111111', mockClient)).toBe(false)
    })
})

export const getSpecificGuild = async (guildId: string, client) => {
    const guild = await client.guilds.fetch(guildId).catch(() => {
        return false
    })

    return guild
}