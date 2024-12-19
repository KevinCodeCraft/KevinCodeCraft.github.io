const app = Vue.createApp({
    data() {
        return {
            players: [],
            allianceMemberRanking: [],
            allianceMembers: [],
            allianceName: "The Stoics",
            Succeed: {},
            Failed: {},
            loading: false,
            ShowContent: false,
            newAllianceName: "The Stoics",
            error: "",
            allianceId: 229, // The Gladiators ID: 229, The Stoics ID: 52862
            minimum: 7000000,
            newMinimum: 7000000,
            event: 46,
            newEvent: 46,
        };
    },
    async mounted() {
        await this.GetPlayers();
    },
    methods: {
        async getAllRankings() {
            try {
                console.log(this.allianceId);
                
                const alliances = await fetch(`https://empire-api.fly.dev/EmpireEx_11/ain/%22AID%22:${this.allianceId}`);
                if (!alliances.ok) {
                    throw new Error(`HTTP error! status: ${alliances.status}`);
                }

                const atextData = await alliances.text();
                const ajsonData = JSON.parse(atextData);

                console.log(atextData);
        
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
        
        async GetPlayers(GetRankings) {
            this.loading = true;

            let allPlayers = [];
            var Repeats = 1;

            if (this.event === 46 || this.event === 44 || this.event === 58) {
                Repeats = 5;
            }

            for (let category = 1; category < Repeats + 1; category++) {
                const response = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:${this.event},%22LID%22:${category},%22SV%22:%221%22`);
                if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                }
            
                const textData = await response.text();
                const jsonData = JSON.parse(textData);
                var Length = Math.ceil(jsonData.content.LR / 4) * 4;
                var Done = false;
    
                Length = Length - 4;

                for (let index = 4; index < Length && Done === false; index += 8) {
                    const response_ = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:${this.event},%22LID%22:${category},%22SV%22:%22${index}%22`);
                    const textData_ = await response_.text();
                    const jsonData_ = JSON.parse(textData_);
    
    
                    const playersData = jsonData_.content.L;
        
                    if (playersData[0] === null) {
                        Done = true;
                        continue;
                    }

                    if (!playersData[0][1] === 0) {
                        Done = true;
                        continue;
                    }


                    console.log(playersData[0][1]);

                    allPlayers = allPlayers.concat(
                        playersData.map(player => ({
                            player: player[2].N,
                            alliance: player[2].AN,
                            allianceId: player[2].AID,
                            points: player[1]
                        }))
                    );
                }
            }

            allPlayers.sort((a, b) => b.points - a.points);

            this.players = allPlayers;
            this.loading = false;

            if (GetRankings) {
                this.getAllRankings();
            }
        }
        ,

        async GetAllianceId() {
            var Id = 0;
            this.players.forEach(Player => {
                if (Player.alliance === this.allianceName) {
                    Id = Player.allianceId;
                }
            })

            return Promise.resolve(Id);
        },
        
        async ChangeAlliance() {
            const waitForLoading = setInterval(async () => {
                if (!this.loading) {
                    clearInterval(waitForLoading);
        
                    if (this.newAllianceName) {
                        this.error = "";
        
                        this.allianceName = this.newAllianceName;
        
                        const NewAllianceId = await this.GetAllianceId();

                        if (NewAllianceId === 0) {
                            this.error = "Ongeldig BG."
                        } else {
                            this.allianceId = NewAllianceId;
                            this.getAllRankings();
                        }         
                    }
                }
            }, 100);
        },        

        async SetMinimum() {
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

        async SetEvent(){
            const waitForLoading = setInterval(() => {
                if (!this.loading) {
                    clearInterval(waitForLoading);
                    if (this.newEvent && typeof this.newEvent === 'number' && this.newEvent >= 0) {
                        this.event = this.newEvent;
        
                        this.GetPlayers(true);
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
