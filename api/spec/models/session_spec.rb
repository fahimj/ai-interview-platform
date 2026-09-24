# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Session, type: :model do
  let(:org) { create(:organization) }
  let(:assessment) { create(:assessment, tenant_id: org.id) }

  it 'generates a 64-character hex invite token automatically on creation' do
    session = create(:session, assessment: assessment, tenant_id: org.id)
    expect(session.invite_token).to be_present
    expect(session.invite_token.length).to eq(64)
  end

  it 'defaults status to pending' do
    session = create(:session, assessment: assessment, tenant_id: org.id)
    expect(session.status).to eq('pending')
    expect(session.pending?).to be true
  end

  it 'characterizes GAP P0-1: invite_url points to port 3001 (API host) instead of web frontend' do
    session = create(:session, assessment: assessment, tenant_id: org.id)
    # APP_BASE_URL default is http://localhost:3001
    expect(session.invite_url).to eq("http://localhost:3001/interview/#{session.invite_token}")
  end
end
