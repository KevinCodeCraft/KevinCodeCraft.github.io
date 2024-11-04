const app = Vue.createApp({
    data() {
        return {
            players: [],
            allianceMemberRanking: [],
            allianceMembers: [],
            allianceName: "The Gladiators",
            Succeed: {},
            Failed: {},
            loading: true,
            error: "",
            allianceId: 229,
            minimum: 7000000
        };
    },
    async mounted() {
        await this.getAllRankings();
    },
    methods: {
        async getAllRankings() {
            try {
                const alliances = await fetch(`https://empire-api.fly.dev/EmpireEx_11/ain/%22AID%22:${this.allianceId}`);
                if (!alliances.ok) {
                    throw new Error(`HTTP error! status: ${alliances.status}`);
                }
        
                const atextData = await alliances.text();
                const ajsonData = JSON.parse(atextData);
        
                let Members = [];
                let MemberData = ajsonData.content.A.M;
                
                Members = MemberData
                    .map(member => ({
                        name: member.N,
                        ar: member.AR
                    }))
                    .sort((a, b) => {
                        if (a.ar !== b.ar) {
                            return a.ar - b.ar;
                        }
                        return a.name.localeCompare(b.name);
                    })
                    .map(member => member.name);
        
                let allPlayers = [];
                let AllianceMembers = [];
        
                const response = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:2,%22LID%22:1,%22SV%22:%221%22`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                const textData = await response.text();
                const jsonData = JSON.parse(textData);
                var Length = Math.ceil(jsonData.content.LR / 5) * 5;
                
                for (let index = 5; index < Length; index += 10) {
                    const response_ = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:2,%22LID%22:1,%22SV%22:%22${index}%22`);
                    const textData_ = await response_.text();
                    const jsonData_ = JSON.parse(textData_);
        
                    const playersData = jsonData_.content.L;
                    allPlayers = allPlayers.concat(playersData.map(player => ({
                        player: player[2].N,
                        alliance: player[2].AN,
                        points: player[1],
                        placement: player[0]
                    })));
        
                    AllianceMembers = AllianceMembers.concat(playersData
                        .filter(player => player[2].AN === this.allianceName)
                        .map(player => ({
                            player: player[2].N,
                            alliance: player[2].AN,
                            points: player[1],
                            placement: player[0]
                        })));
                }
        
                let NoScore = {};
                NoScore = MemberData
                    .filter(member => !AllianceMembers.some(allianceMember => allianceMember.player === member.N))
                    .reduce((acc, member) => {
                        acc[member.N] = 0;
                        return acc;
                    }, {});
        
                let Succeed = {};
                let Failed = {};

                AllianceMembers.forEach(member => {
                    if (member.points > this.minimum) {
                        Succeed[member.player] = member.points;
                    } else {
                        Failed[member.player] = member.points;
                    }
                });
        
                // Merge NoScore into Failed
                for (const Member in NoScore) {
                    Failed[Member] = NoScore[Member];
                }
        
                // Assign values to Vue data properties after all fetching and processing
                this.players = allPlayers;
                this.allianceMemberRanking = AllianceMembers;
                this.allianceMembers = Members;
                this.Succeed = Succeed;
                this.Failed = Failed;
        
                console.log(`${Object.keys(Succeed).length + Object.keys(Failed).length}/${Object.keys(MemberData).length} scores found.`);
            } catch (error) {
                this.error = `Error fetching data: ${error.message}`;
            } finally {
                this.loading = false;
            }
        },        
        
        formatNumber(number) {
            if (typeof number !== 'number') {
                return number;
            }
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
        },
    }
});

app.mount("#app");
