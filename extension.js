'use strict'

module.exports = function (nodecg) {
  var donationsRep = nodecg.Replicant('donations', {
    defaultValue: []
  })
  var allDonationsRep = nodecg.Replicant('alldonations', {
    defaultValue: []
  })
  var campaignTotalRep = nodecg.Replicant('total', {
    defaultValue: 0
  })
  var pollsRep = nodecg.Replicant('donationpolls', {
    defaultValue: []
  })
  var scheduleRep = nodecg.Replicant('schedule', {
    defaultValue: []
  })
  var challengesRep = nodecg.Replicant('challenges', {
    defaultValue: []
  })
  var rewardsRep = nodecg.Replicant('rewards', {
    defaultValue: []
  })
  var campaignGoalRep = nodecg.Replicant('goal', {
    defaultValue: 0
  })
  var supportableRep = nodecg.Replicant('supportable', {
    defaultValue: false
  })
  var supportingCampaignsRep = nodecg.Replicant('supportingcampaigns', {
    defaultValue: []
  })

  var TiltifyClient = require('tiltify-api-client')

  if (nodecg.bundleConfig.tiltify_api_key === '') {
    nodecg.log.info('Please set tiltify_api_key in cfg/nodecg-tiltify.json')
    return
  }

  if (nodecg.bundleConfig.tiltify_campaign_id === '') {
    nodecg.log.info('Please set tiltify_campaign_id in cfg/nodecg-tiltify.json')
    return
  }

  var client = new TiltifyClient(nodecg.bundleConfig.tiltify_api_key)

  async function askTiltifyForDonations (campaignId = nodecg.bundleConfig.tiltify_campaign_id) {
    client.Campaigns.getRecentDonations(campaignId, function (donations) {
      if (donations.length >= 1) {
        for (let i = 0; i < donations.length; i++) {
          var found = donationsRep.value.find(function (element) {
            return element.id === donations[i].id
          })
          if (found === undefined) {
            donations[i].shown = false
            donations[i].read = false
            donationsRep.value.push(donations[i])
          }
        }
      }
    })
  }

  async function askTiltifyForAllDonations (campaignId = nodecg.bundleConfig.tiltify_campaign_id) {
    client.Campaigns.getDonations(campaignId, function (alldonations) {
      if (JSON.stringify(allDonationsRep.value) !== JSON.stringify(alldonations)) {
        allDonationsRep.value = alldonations
      }
    })
  }

  async function askTiltifyForPolls () {
    client.Campaigns.getPolls(nodecg.bundleConfig.tiltify_campaign_id, function (polls) {
      if (JSON.stringify(pollsRep.value) !== JSON.stringify(polls)) {
        pollsRep.value = polls
      }
    })
  }

  async function askTiltifyForSchedule () {
    client.Campaigns.getSchedule(nodecg.bundleConfig.tiltify_campaign_id, function (schedule) {
      if (JSON.stringify(scheduleRep.value) !== JSON.stringify(schedule)) {
        scheduleRep.value = schedule
      }
    })
  }

  async function askTiltifyForChallenges () {
    client.Campaigns.getChallenges(nodecg.bundleConfig.tiltify_campaign_id, function (challenges) {
      if (JSON.stringify(challengesRep.value) !== JSON.stringify(challenges)) {
        challengesRep.value = challenges
      }
    })
  }

  async function askTiltifyForRewards () {
    client.Campaigns.getRewards(nodecg.bundleConfig.tiltify_campaign_id, function (rewards) {
      if (JSON.stringify(rewardsRep.value) !== JSON.stringify(rewards)) {
        rewardsRep.value = rewards
      }
    })
  }

  async function askTiltifyForTotal () {
    client.Campaigns.get(nodecg.bundleConfig.tiltify_campaign_id, function (campaign) {
      if (campaignTotalRep.value !== parseFloat(campaign.totalAmountRaised)) {
        campaignTotalRep.value = parseFloat(campaign.totalAmountRaised)
      }
    })
  }

  async function askTiltifyForGoal () {
    client.Campaigns.get(nodecg.bundleConfig.tiltify_campaign_id, function (campaign) {
      if (campaignGoalRep.value !== parseFloat(campaign.fundraiserGoalAmount)) {
        campaignGoalRep.value = parseFloat(campaign.fundraiserGoalAmount)
      }
    })
  }

  async function askTiltifyForCampaignSupportable () {
    client.Campaigns.get(nodecg.bundleConfig.tiltify_campaign_id, function (campaign) {
      if (supportableRep.value !== campaign.supportable) {
        supportableRep.value = campaign.supportable
      }
    })
  }

  async function askTiltifyForSupportingCampaigns() {
    client.Campaigns.getSupportingCampaigns(nodecg.bundleConfig.tiltify_campaign_id, function (supportingcampaigns) {
      if (JSON.stringify(supportingCampaignsRep.value) !== JSON.stringify(supportingcampaigns)) {
        supportingCampaignsRep.value = supportingcampaigns
      }
    })
  }

  function askTiltify () {
    askTiltifyForDonations()
    if (supportableRep.value === true) {
      for (const supportCampaign of supportingCampaignsRep.value) {
        (async () => await askTiltifyForDonations(supportCampaign.id))();
      }
    }
    askTiltifyForPolls()
    askTiltifyForGoal()
    askTiltifyForTotal()
    askTiltifyForChallenges()
    askTiltifyForSchedule()
    askTiltifyForRewards()
  }

  askTiltifyForCampaignSupportable()
  askTiltifyForSupportingCampaigns()

  setInterval(function () {
    askTiltify()
  }, 10000)

  setInterval(function() {
    askTiltifyForAllDonations()
  }, 10000)

  // askTiltify()
  // askTiltifyForAllDonations()
}
