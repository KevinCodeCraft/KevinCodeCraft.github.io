const app = Vue.createApp({
    data() {
        return {
            players: [],
            allianceMemberRanking: [],
            allianceMembers: [],
            allianceName: "The Gladiators",
            Succeed: {},
            Failed: {},
            loading: false,
            ShowContent: false,
            newAllianceName: "The Gladiators",
            error: "",
            allianceId: 229, // The Gladiators ID: 229, The Stoics ID: 52862
            minimum: 7000000,
            newMinimum: 7000000
        };
    },
    async mounted() {
        await this.GetPlayers();
    },
    methods: {
        async GetPlayers() {
            this.loading = true;

            let allPlayers = [];

            const response = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:2,%22LID%22:1,%22SV%22:%221%22`);
            if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const textData = await response.text();
            const jsonData = JSON.parse(textData);
            var Length = Math.ceil(jsonData.content.LR / 5) * 5;

            var Done = false;

            for (let index = 5; index < Length && Done === false; index += 10) {
                const response_ = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:2,%22LID%22:1,%22SV%22:%22${index}%22`);
                const textData_ = await response_.text();
                const jsonData_ = JSON.parse(textData_);

                console.log(jsonData_)

                const playersData = jsonData_.content.L;

                if (playersData[0][1] === 0) {
                    Done = true;
                    continue;
                }

                allPlayers = allPlayers.concat(playersData.map(player => ({
                    player: player[2].N,
                    alliance: player[2].AN,
                    allianceId: player[2].AID,
                    points: player[1],
                    placement: player[0]
                })));
            }

            this.players = allPlayers;
            this.loading = false;
        }
        ,
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
        
                let allPlayers = this.players;
                let AllianceMembers = [];

                allPlayers.forEach(Player => {
                    if (Player.allianceId === this.allianceId) {
                        AllianceMembers.push({
                            player: Player.player,
                            alliance: Player.alliance,
                            points: Player.points,
                            placement: Player.placement
                        });
                    }
                });
        
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
        
                for (const Member in NoScore) {
                    Failed[Member] = NoScore[Member];
                }

                this.allianceMemberRanking = AllianceMembers;
                this.allianceMembers = Members;
                this.Succeed = Succeed;
                this.Failed = Failed;
        
                console.log(`${Object.keys(Succeed).length + Object.keys(Failed).length}/${Object.keys(MemberData).length} scores found.`);
            } catch (error) {
                this.error = `Error fetching data: ${error.message}`;
            } finally {
                this.loading = false;
                this.ShowContent = true;
            }
        },

        GetAllianceName() {
            var Id = 0;
            this.players.forEach(Player => {
                if (Player.alliance === this.allianceName) {
                    Id = Player.allianceId;
                }
            })

            return Id;
        },
        
        ChangeAlliance() {
            const waitForLoading = setInterval(() => {
                if (!this.loading) {
                    clearInterval(waitForLoading);
                    if (this.newAllianceName) {
                        this.error = "";

                        this.allianceName = this.newAllianceName;
                        console.log(this.allianceName)

                        const NewAllianceId = this.GetAllianceName();

                        if (NewAllianceId === 0) {
                            this.error = "Ongeldig BG."
                        } else {
                            this.allianceId = NewAllianceId;
                            this.getAllRankings();
                        }                        
                    } else {
                        this.error = "Ongeldig BG.";
                    }
                }
            }, 100);
        },        

        SetMinimum() {
            const waitForLoading = setInterval(() => {
                if (!this.loading) {
                    clearInterval(waitForLoading);
                    if (this.newMinimum && typeof this.newMinimum === 'number' && this.newMinimum >= 0) {
                        this.minimum = this.newMinimum;
        
                        this.getAllRankings();
                    }
                }
            }, 100);
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
